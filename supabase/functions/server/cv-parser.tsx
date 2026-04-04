/**
 * CV Parser — Text extraction + Qwen (Alibaba Cloud) structured parsing
 *
 * Supports: PDF (via unpdf), DOCX (via JSZip XML parsing), TXT
 * Returns structured profile data parsed by Alibaba Qwen via DashScope,
 * with DeepSeek backup for text-based parsing when quota is exhausted.
 */
import {
  createAiAttempts,
  normalizeTokenUsage,
  type AiTokenUsage,
  requestCompatibleCompletionWithFallback,
  shouldFallbackToBackup,
} from "./ai-provider.ts";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const QWEN_API_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const VISION_MODEL_LEGACY = "qwen-vl-ocr";
const VISION_MODEL_RECENT = "qwen-vl-ocr-2025-11-20";
const VISION_MODEL_CURRENT = "qwen-vl-max";

/**
 * Public / guest: legacy OCR first, then the newer OCR, then the current model.
 * Privileged accounts: newer OCR first, then the current model.
 */
function getVisionModelSequence(usePrivilegedVisionModel: boolean): string[] {
  return usePrivilegedVisionModel
    ? [VISION_MODEL_RECENT, VISION_MODEL_CURRENT]
    : [VISION_MODEL_LEGACY, VISION_MODEL_RECENT, VISION_MODEL_CURRENT];
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface ParsedCVProfile {
  fullName: string;
  jobTitle: string;
  experienceSummary: string;
  recentPositions: Array<{
    company: string;
    role: string;
    period: string;
    highlights: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  /** Technical skills: programming languages, frameworks, methodologies, domain knowledge */
  skills: string[];
  /** Tools & technologies: software, platforms, IDEs, cloud services, databases */
  tools: string[];
  /** Spoken languages with proficiency, e.g. "Tiếng Anh - IELTS 7.5", "Tiếng Việt - Bản ngữ" */
  languages: string[];
  /** Certifications, awards, courses */
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  /** Projects or notable achievements not covered in positions */
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
  rawTextLength: number;
  parsedAt: string;
  /** Cloudinary file info */
  fileUrl: string;
  fileName: string;
}

export interface ParsedCVParseResult {
  profile: ParsedCVProfile | null;
  usage: AiTokenUsage | null;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Text extraction — DOCX                                              */
/*  DOCX = ZIP containing word/document.xml with <w:t> text nodes      */
/* ------------------------------------------------------------------ */
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import("npm:jszip@3.10.1")).default;
    const zip = await JSZip.loadAsync(buffer);
    const docFile = zip.file("word/document.xml");

    if (!docFile) {
      console.log("[cv-parser] DOCX: word/document.xml not found in ZIP");
      return "";
    }

    const xml = await docFile.async("string");

    // Replace paragraph endings with newlines, then extract text from <w:t> tags
    let text = xml
      // Add newline before each paragraph
      .replace(/<\/w:p>/gi, "\n")
      // Extract text content from w:t tags (including space-preserved)
      .replace(/<w:t[^>]*>([^<]*)<\/w:t>/gi, "$1")
      // Remove all remaining XML tags
      .replace(/<[^>]+>/g, "")
      // Decode common XML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      // Normalize whitespace
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    console.log(`[cv-parser] DOCX extracted: ${text.length} chars`);
    return text;
  } catch (err) {
    console.log(`[cv-parser] DOCX extraction error: ${err}`);
    throw new Error(`Failed to extract text from DOCX: ${err}`);
  }
}

/* ------------------------------------------------------------------ */
/*  Text extraction — PDF                                               */
/*  Primary: unpdf (WASM). Fallback: raw binary string scanning.        */
/* ------------------------------------------------------------------ */

/** Fallback: scan raw PDF bytes for readable text strings */
function extractPdfTextRaw(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const raw = new TextDecoder("latin1").decode(bytes);

  const textChunks: string[] = [];

  // Extract text from PDF text objects: BT ... ET blocks containing Tj/TJ operators
  // Pattern 1: (text) Tj
  const tjMatches = raw.matchAll(/\(([^)]{2,})\)\s*Tj/g);
  for (const m of tjMatches) {
    const decoded = m[1]
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
    if (decoded.trim()) textChunks.push(decoded.trim());
  }

  // Pattern 2: TJ arrays [(text) num (text) ...]
  const tjArrayMatches = raw.matchAll(/\[([^\]]*)\]\s*TJ/gi);
  for (const m of tjArrayMatches) {
    const inner = m[1];
    const parts = inner.matchAll(/\(([^)]*)\)/g);
    const line: string[] = [];
    for (const p of parts) {
      const decoded = p[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      if (decoded) line.push(decoded);
    }
    if (line.length > 0) textChunks.push(line.join(""));
  }

  // Try UTF-8 decoding of the joined text to handle Vietnamese/Unicode
  let text = textChunks.join("\n").trim();

  // Also try extracting text from UTF-16BE streams (common in PDF for Unicode)
  if (text.length < 50) {
    // Look for readable ASCII runs as last resort
    const asciiRuns: string[] = [];
    let run = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 32 && b < 127) {
        run += String.fromCharCode(b);
      } else if (b === 10 || b === 13) {
        if (run.length >= 4) asciiRuns.push(run.trim());
        run = "";
      } else {
        if (run.length >= 4) asciiRuns.push(run.trim());
        run = "";
      }
    }
    if (run.length >= 4) asciiRuns.push(run.trim());

    // Filter out PDF syntax/operators
    const pdfKeywords = /^(%|\/|<<|>>|obj|endobj|stream|endstream|xref|trailer|startxref|\d+ \d+ R|\d+ \d+ obj|null|true|false)/;
    const meaningful = asciiRuns.filter(
      (s) => s.length > 3 && !pdfKeywords.test(s) && !/^[\d\s.]+$/.test(s)
    );

    if (meaningful.join(" ").length > text.length) {
      text = meaningful.join("\n").trim();
    }
  }

  console.log(`[cv-parser] PDF raw-text fallback extracted: ${text.length} chars`);
  return text;
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  // Primary: try unpdf (WASM-based, best quality)
  try {
    const { extractText } = await import("npm:unpdf@0.12.1");
    const uint8 = new Uint8Array(buffer);
    const result = await extractText(uint8, { mergePages: true });
    const text = (result.text || "").trim();
    console.log(`[cv-parser] PDF unpdf extracted: ${text.length} chars, ${result.totalPages} pages`);
    if (text.length >= 20) return text;
    console.log("[cv-parser] unpdf returned too little text, trying raw fallback...");
  } catch (err) {
    console.log(`[cv-parser] PDF unpdf extraction failed: ${err}`);
    console.log("[cv-parser] Trying raw PDF text fallback...");
  }

  // Fallback: raw binary string scanning
  try {
    const rawText = extractPdfTextRaw(buffer);
    if (rawText.length >= 20) return rawText;
  } catch (rawErr) {
    console.log(`[cv-parser] PDF raw fallback also failed: ${rawErr}`);
  }

  // Return whatever we got (might be empty — caller will handle)
  return "";
}

/* ------------------------------------------------------------------ */
/*  Text extraction — TXT                                               */
/* ------------------------------------------------------------------ */
function extractTxtText(buffer: ArrayBuffer): string {
  const text = new TextDecoder("utf-8").decode(buffer).trim();
  console.log(`[cv-parser] TXT extracted: ${text.length} chars`);
  return text;
}

/* ------------------------------------------------------------------ */
/*  Main extraction dispatcher                                          */
/* ------------------------------------------------------------------ */
export async function extractTextFromFile(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  switch (ext) {
    case "pdf":
      return extractPdfText(buffer);
    case "docx":
      return extractDocxText(buffer);
    case "doc":
      // .doc (old Word format) — try DOCX extraction, fallback to raw text
      try {
        return await extractDocxText(buffer);
      } catch {
        console.log("[cv-parser] .doc fallback to raw text decode");
        return extractTxtText(buffer);
      }
    case "txt":
      return extractTxtText(buffer);
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

/* ------------------------------------------------------------------ */
/*  Qwen (Alibaba Cloud) structured parsing                             */
/*  Uses DashScope OpenAI-compatible API with qwen-max model            */
/* ------------------------------------------------------------------ */
const CV_PARSE_SYSTEM_PROMPT = `You are a professional CV/Resume parser with 95%+ accuracy. Your job is to extract ALL structured information from raw CV text, with special attention to skills, tools, technologies, and certifications.

Return a valid JSON object with EXACTLY this structure — no markdown, no explanation, no extra text:
{
  "fullName": "string",
  "jobTitle": "string - Current or most recent job title / target role",
  "experienceSummary": "string - Brief summary of total experience, e.g. '5 năm kinh nghiệm trong lĩnh vực phát triển phần mềm'",
  "recentPositions": [
    {
      "company": "string",
      "role": "string",
      "period": "string, e.g. '01/2023 - Hiện tại'",
      "highlights": "string - 2-3 key achievements or responsibilities, separated by semicolons"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "skills": [
    "string - Technical skills: programming languages (JavaScript, Python, Java), frameworks (React, Vue, Angular, Spring Boot), methodologies (Agile, Scrum, TDD), domain knowledge (REST APIs, Microservices, OOP, Data Structures)"
  ],
  "tools": [
    "string - Tools & technologies: IDEs (VS Code, IntelliJ), platforms (AWS, Azure, GCP), databases (PostgreSQL, MongoDB, Redis), version control (Git, GitHub, GitLab), CI/CD (Jenkins, GitHub Actions, Docker, Kubernetes), communication (Slack, Jira, Confluence), other software"
  ],
  "languages": [
    "string - Spoken languages with proficiency level, e.g. 'Tiếng Anh - IELTS 7.5', 'Tiếng Việt - Bản ngữ', 'Tiếng Trung - HSK 4'"
  ],
  "certifications": [
    {
      "name": "string - Certification, award, or course name",
      "issuer": "string - Issuing organization",
      "year": "string - Year obtained"
    }
  ],
  "projects": [
    {
      "name": "string - Project name",
      "description": "string - Brief description of the project and your role",
      "technologies": "string - Technologies/tools used, separated by commas"
    }
  ]
}

Rules:
1. recentPositions: Include UP TO 5 most recent positions/projects/companies, sorted most recent first.
2. skills: Extract ALL technical skills mentioned. Group related skills together. Include programming languages, frameworks, libraries, design patterns, architectural styles, testing methodologies, domain-specific knowledge.
3. tools: Extract ALL tools, platforms, and technologies. Include cloud platforms, databases, version control systems, CI/CD tools, IDEs, project management tools, containerization, monitoring tools.
4. languages: Extract spoken/written languages with proficiency levels (IELTS, TOEFL, HSK, CEFR, or native/fluent/intermediate/basic).
5. certifications: Include professional certifications (AWS Certified, PMP, Scrum Master), awards, honors, relevant courses completed.
6. projects: Include personal projects, open-source contributions, side projects, or notable achievements NOT already covered in recentPositions.
7. Be THOROUGH — scan the entire CV including skills sections, sidebars, headers, footers, and project descriptions.
8. If a field is not found in the CV, use "" (empty string) or [] (empty array).
9. Keep the ORIGINAL LANGUAGE of the CV content (Vietnamese or English).
10. Merge scattered info intelligently — e.g. if name appears in header and footer, use the most complete version.
11. For experienceSummary, calculate total years from the positions listed if not explicitly stated.
12. Return ONLY the raw JSON object. No \`\`\`json markers, no explanation.`;

function parseStructuredProfileContent(
  content: string,
  rawTextLength: number,
): ParsedCVProfile {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    fullName: parsed.fullName || "",
    jobTitle: parsed.jobTitle || "",
    experienceSummary: parsed.experienceSummary || "",
    recentPositions: Array.isArray(parsed.recentPositions)
      ? parsed.recentPositions.slice(0, 5).map((p: Record<string, string>) => ({
          company: p.company || "",
          role: p.role || "",
          period: p.period || "",
          highlights: p.highlights || "",
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((e: Record<string, string>) => ({
          institution: e.institution || "",
          degree: e.degree || "",
          year: e.year || "",
        }))
      : [],
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.filter((s: string) => typeof s === "string" && s.trim()).map((s: string) => s.trim())
      : [],
    tools: Array.isArray(parsed.tools)
      ? parsed.tools.filter((t: string) => typeof t === "string" && t.trim()).map((t: string) => t.trim())
      : [],
    languages: Array.isArray(parsed.languages)
      ? parsed.languages.filter((l: string) => typeof l === "string" && l.trim()).map((l: string) => l.trim())
      : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map((c: Record<string, string>) => ({
          name: c.name || "",
          issuer: c.issuer || "",
          year: c.year || "",
        }))
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((p: Record<string, string>) => ({
          name: p.name || "",
          description: p.description || "",
          technologies: p.technologies || "",
        }))
      : [],
    rawTextLength,
    parsedAt: new Date().toISOString(),
    fileUrl: "",
    fileName: "",
  };
}

export async function parseWithQwen(
  cvText: string,
  apiKey: string,
): Promise<ParsedCVParseResult> {
  // Truncate very long CVs to control token costs (qwen-max supports 128K context)
  // 16K chars covers most 3-5 page CVs comfortably
  const truncated = cvText.length > 16000 ? cvText.slice(0, 16000) + "\n\n[... truncated ...]" : cvText;

  try {
    const attempts = createAiAttempts({
      purpose: "cv-text",
      primaryApiKey: apiKey,
    });

    console.log(
      `[cv-parser] Sending ${truncated.length} chars (full: ${cvText.length}) to ${attempts.map((attempt) => attempt.label).join(" -> ")} for parsing`,
    );

    // 60s timeout for AI call to avoid edge function timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const { response, provider } = await requestCompatibleCompletionWithFallback(
      attempts,
      () => ({
        messages: [
          { role: "system", content: CV_PARSE_SYSTEM_PROMPT },
          { role: "user", content: `Parse this CV:\n---\n${truncated}\n---` },
        ],
        temperature: 0.1, // Low temperature for structured extraction
        max_tokens: 2048,
        stream: false,
      }),
      controller.signal,
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.log(`[cv-parser] Qwen API error: ${response.status} ${errText}`);
      throw new Error(`Qwen API returned ${response.status}`);
    }

    const data = await response.json();
    const usage = normalizeTokenUsage(data.usage);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.log(`[cv-parser] ${provider.label} returned empty content`);
      return {
        profile: null,
        usage,
        error: `${provider.label} returned empty content`,
      };
    }

    console.log(`[cv-parser] ${provider.label} response length: ${content.length} chars`);
    try {
      return {
        profile: parseStructuredProfileContent(content, cvText.length),
        usage,
      };
    } catch (parseErr) {
      const errorMessage =
        parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.log(`[cv-parser] JSON parse error: ${errorMessage}`);
      return {
        profile: null,
        usage,
        error: `Invalid JSON returned by ${provider.label}: ${errorMessage}`,
      };
    }
  } catch (err) {
    console.log(`[cv-parser] Parse error: ${err}`);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/*  Qwen Vision — parse CV from image using qwen-vl-max                */
/*  OCR + structured extraction in a single API call                   */
/* ------------------------------------------------------------------ */
const CV_IMAGE_PARSE_PROMPT = `You are a professional CV/Resume parser with vision capabilities.
Look at this CV/Resume image(s) carefully and extract ALL text content from EVERY page.
Then parse the extracted information into a structured JSON object.

IMPORTANT: If multiple page images are provided, you MUST read and combine information from ALL pages. Do NOT only read the first page. Experience, education, skills, tools, certifications, and projects may span across multiple pages.

Return a valid JSON object with EXACTLY this structure — no markdown, no explanation, no extra text:
{
  "fullName": "string",
  "jobTitle": "string - Current or most recent job title / target role",
  "experienceSummary": "string - Brief summary of total experience",
  "recentPositions": [
    {
      "company": "string",
      "role": "string",
      "period": "string, e.g. '01/2023 - Present'",
      "highlights": "string - 2-3 key achievements or responsibilities, separated by semicolons"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "skills": [
    "string - Technical skills: programming languages, frameworks, libraries, methodologies, domain knowledge"
  ],
  "tools": [
    "string - Tools & technologies: software, platforms, databases, IDEs, cloud services, DevOps tools"
  ],
  "languages": [
    "string - Spoken languages with proficiency, e.g. 'English - IELTS 7.5', 'Vietnamese - Native'"
  ],
  "certifications": [
    {
      "name": "string - Certification, award, or course name",
      "issuer": "string - Issuing organization",
      "year": "string - Year obtained"
    }
  ],
  "projects": [
    {
      "name": "string - Project name",
      "description": "string - Brief description",
      "technologies": "string - Technologies used, comma-separated"
    }
  ]
}

Rules:
1. Read ALL text in ALL images carefully, including small text, headers, footers, sidebars, skill tags.
2. recentPositions: Include UP TO 5 most recent positions, sorted most recent first.
3. skills: Extract ALL technical skills visible in the CV - languages, frameworks, methodologies, patterns.
4. tools: Extract ALL tools, platforms, databases, cloud services, IDEs, DevOps tools visible.
5. languages: Extract spoken languages with proficiency levels (IELTS, TOEFL, HSK, CEFR, native/fluent).
6. certifications: Include certifications, awards, honors, courses visible in the CV.
7. projects: Include personal projects or notable achievements not covered in work experience.
8. Be VERY THOROUGH — scan every section, every page carefully.
9. If a field is not clearly visible, use "" (empty string) or [] (empty array).
10. Keep the ORIGINAL LANGUAGE of the CV content (Vietnamese or English).
11. For Vietnamese text with diacritics (dấu), preserve them accurately.
12. Return ONLY the raw JSON object. No \`\`\`json markers, no explanation.`;

export interface ParseImageWithQwenOptions {
  usePrivilegedVisionModel?: boolean;
}

/**
 * Parse CV from image(s) using a role-aware vision fallback chain.
 * Supports single URL (legacy) or array of page URLs for multi-page PDFs.
 */
export async function parseImageWithQwen(
  imageUrlOrUrls: string | string[],
  apiKey: string,
  options: ParseImageWithQwenOptions = {},
): Promise<ParsedCVParseResult> {
  const imageUrls = Array.isArray(imageUrlOrUrls) ? imageUrlOrUrls : [imageUrlOrUrls];
  // Cap at 8 pages to stay within DashScope vision limits and keep retries bounded.
  const cappedUrls = imageUrls.slice(0, 8);
  const visionModels = getVisionModelSequence(options.usePrivilegedVisionModel ?? false);

  console.log(
    `[cv-parser] Sending ${cappedUrls.length} page image(s) to Qwen Vision (${visionModels.join(" -> ")}) for OCR + parsing`,
  );

  try {
    // 90s timeout for multi-page Vision — more images = more time
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    // Build content array: all images first, then the text prompt
    const contentParts: Array<Record<string, unknown>> = [];
    for (const url of cappedUrls) {
      contentParts.push({
        type: "image_url",
        image_url: { url },
      });
    }
    contentParts.push({
      type: "text",
      text: cappedUrls.length > 1
        ? `This CV has ${cappedUrls.length} pages. Read ALL pages carefully and combine the information.\n\n${CV_IMAGE_PARSE_PROMPT}`
        : CV_IMAGE_PARSE_PROMPT,
    });

    try {
      for (let index = 0; index < visionModels.length; index += 1) {
        const model = visionModels[index];
        console.log(`[cv-parser] Trying Qwen Vision model: ${model}`);

        let response: Response;
        try {
          response = await fetch(QWEN_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "user",
                  content: contentParts,
                },
              ],
              temperature: 0.1,
              max_tokens: 3072,
              stream: false,
            }),
            signal: controller.signal,
          });
        } catch (fetchErr) {
          if (index < visionModels.length - 1) {
            console.log(`[cv-parser] Qwen Vision model ${model} request failed: ${fetchErr}`);
            continue;
          }
          throw fetchErr;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.log(`[cv-parser] Qwen Vision model ${model} API error: ${response.status} ${errText}`);
          if (index < visionModels.length - 1 && shouldFallbackToBackup(response.status, errText)) {
            console.log(`[cv-parser] Falling back from ${model} to next vision model`);
            continue;
          }
          throw new Error(`Qwen Vision model ${model} returned ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const usage = normalizeTokenUsage(data.usage);
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          console.log("[cv-parser] Qwen Vision returned empty content");
          return {
            profile: null,
            usage,
            error: "Qwen Vision returned empty content",
          };
        }

        console.log(`[cv-parser] Qwen Vision response length: ${content.length} chars`);
        try {
          return {
            profile: parseStructuredProfileContent(content, 0),
            usage,
          };
        } catch (parseErr) {
          const errorMessage =
            parseErr instanceof Error ? parseErr.message : String(parseErr);
          console.log(`[cv-parser] Vision JSON parse error: ${errorMessage}`);
          return {
            profile: null,
            usage,
            error: `Invalid JSON returned by Qwen Vision (${model}): ${errorMessage}`,
          };
        }
      }

      throw new Error(`Qwen Vision model sequence exhausted: ${visionModels.join(" -> ")}`);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.log(`[cv-parser] Vision parse error: ${err}`);
    throw err;
  }
}
