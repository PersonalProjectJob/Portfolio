import {
  getDashscopeApiKey,
  getDeepseekApiKey,
  normalizeTokenUsage,
  requestCompatibleCompletionWithFallback,
  type AiTokenUsage,
  type ProviderAttempt,
} from "./ai-provider.ts";
import type { ParsedCVProfile } from "./cv-parser.tsx";

export type Locale = "vi" | "en";

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  domain: string;
  location: string;
  level: string;
  jobSummary: string;
  description: string;
  requirements: string;
  skills: string;
  url: string;
}

export interface MatchDimension {
  score: number;
  justification: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface JobMatchResult {
  job: JobRecord;
  overallScore: number;
  domainKnowledge: MatchDimension;
  workingExperience: MatchDimension;
  requirementsOfSkills: MatchDimension;
  finalRecommendation: string;
}

export interface JobRecommendationResponse {
  profile: (ParsedCVProfile & { id: string }) | null;
  matches: JobMatchResult[];
  bestMatch: JobMatchResult | null;
  overallSummary: string;
  analysisMarkdown: string;
  generatedAt: string;
  totalJobsAnalyzed: number;
  providerLabel?: string;
  usage: AiTokenUsage | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const DOMAIN_HINTS = [
  "frontend",
  "backend",
  "fullstack",
  "software",
  "developer",
  "engineer",
  "data",
  "analyst",
  "design",
  "marketing",
  "finance",
  "sales",
  "operations",
  "hr",
  "product",
  "cloud",
  "devops",
];
const SKILL_HINTS = [
  "react",
  "typescript",
  "javascript",
  "nodejs",
  "python",
  "java",
  "sql",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "figma",
  "tableau",
  "powerbi",
  "excel",
  "agile",
  "scrum",
  "cicd",
  "graphql",
  "rest",
  "api",
  "html",
  "css",
  "tailwind",
  "nextjs",
  "vue",
  "angular",
  "communication",
];

function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(" ");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(toText).filter(Boolean).join(" ");
  return "";
}

function normalizeKeyName(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function getRowValue(row: Record<string, unknown>, keys: string[]): unknown {
  const entries = Object.entries(row);

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      return row[key];
    }

    const normalizedKey = normalizeKeyName(key);
    const matchedEntry = entries.find(([rowKey]) => normalizeKeyName(rowKey) === normalizedKey);
    if (matchedEntry) {
      return matchedEntry[1];
    }
  }

  return undefined;
}

function pickText(row: Record<string, unknown>, keys: string[]): string {
  return toText(getRowValue(row, keys));
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bc\+\+\b/g, "cplusplus")
    .replace(/\bc#\b/g, "csharp")
    .replace(/\bnode\.?js\b/g, "nodejs")
    .replace(/\bnext\.?js\b/g, "nextjs")
    .replace(/\breact\.?js\b/g, "react")
    .replace(/\bvue\.?js\b/g, "vue")
    .replace(/\bpower\s*bi\b/g, "powerbi")
    .replace(/\bfront[-\s]?end\b/g, "frontend")
    .replace(/\bback[-\s]?end\b/g, "backend")
    .replace(/\bfull[-\s]?stack\b/g, "fullstack")
    .replace(/\bci\s*\/\s*cd\b/g, "cicd")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPattern(haystack: string, pattern: string): boolean {
  const normalizedHaystack = ` ${normalizeText(haystack)} `;
  const normalizedPattern = ` ${normalizeText(pattern)} `;
  return normalizedHaystack.includes(normalizedPattern);
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function extractKeywords(text: string, limit = 16): string[] {
  const stopWords = new Set([
    "and",
    "the",
    "for",
    "with",
    "from",
    "that",
    "this",
    "have",
    "has",
    "was",
    "are",
    "job",
    "jobs",
    "role",
    "position",
    "title",
    "company",
    "description",
    "requirements",
    "summary",
    "experience",
    "skills",
    "skill",
    "cv",
    "resume",
    "your",
    "our",
    "you",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "va",
    "cua",
    "cho",
    "trong",
    "voi",
    "mot",
    "cac",
    "nhung",
    "nay",
    "nay",
    "khong",
    "duoc",
    "la",
    "qua",
    "nam",
  ]);

  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    if (stopWords.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .map(([token]) => token)
    .slice(0, limit);
}

function extractHintTags(text: string, hints: string[]): string[] {
  const result: string[] = [];
  for (const hint of hints) {
    if (hasPattern(text, hint)) {
      result.push(hint);
    }
  }
  return Array.from(new Set(result));
}

function intersectOrdered(source: string[], target: string[]): string[] {
  const targetSet = new Set(target);
  return Array.from(new Set(source.filter((item) => targetSet.has(item))));
}

function complementOrdered(source: string[], target: string[]): string[] {
  const targetSet = new Set(target);
  return Array.from(new Set(source.filter((item) => !targetSet.has(item))));
}

function clamp(value: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Math.round(clamp(value) * 10) / 10;
}

function extractYearRange(text: string): { start: number; end: number } | null {
  const normalized = normalizeText(text);
  const rangeMatch = normalized.match(/(\d{4})\s*(?:-|to|den|->|→)\s*(\d{4}|present|now|current|hien tai)/i);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const endText = normalizeText(rangeMatch[2]);
    const end = /present|now|current|hien tai/.test(endText) ? CURRENT_YEAR : Number(rangeMatch[2]);
    if (!Number.isNaN(start) && !Number.isNaN(end)) return { start, end };
  }

  const singleYear = normalized.match(/\b(19|20)\d{2}\b/);
  if (singleYear) {
    const year = Number(singleYear[0]);
    return { start: year, end: year + 1 };
  }

  return null;
}

function estimateExperienceYears(profile: (ParsedCVProfile & { id: string }) | null): number {
  if (!profile) return 0;

  const explicit = profile.experienceSummary.match(/(\d+(?:[.,]\d+)?)\+?\s*(?:years?|yrs?|nam)/i);
  if (explicit) return Number(explicit[1].replace(",", "."));

  const ranges = profile.recentPositions
    .map((position) => extractYearRange(position.period || ""))
    .filter((value): value is { start: number; end: number } => value !== null);

  if (ranges.length > 0) {
    const earliest = Math.min(...ranges.map((range) => range.start));
    const latest = Math.max(...ranges.map((range) => range.end));
    return Math.max(0, latest - earliest);
  }

  return profile.recentPositions.length > 0 ? Math.max(1, profile.recentPositions.length) : 0;
}

function detectSeniority(text: string): { tag: string; years: number } {
  const normalized = normalizeText(text);
  const levels = [
    { tag: "intern", years: 0, patterns: ["intern", "thuc tap"] },
    { tag: "junior", years: 1, patterns: ["junior", "fresher", "entry level"] },
    { tag: "mid", years: 3, patterns: ["mid", "middle", "intermediate"] },
    { tag: "senior", years: 5, patterns: ["senior", "sr"] },
    { tag: "lead", years: 7, patterns: ["lead", "principal", "staff"] },
    { tag: "manager", years: 8, patterns: ["manager", "head", "director"] },
  ];

  for (const entry of levels) {
    if (entry.patterns.some((pattern) => hasPattern(normalized, pattern))) {
      return { tag: entry.tag, years: entry.years };
    }
  }

  return { tag: "", years: 0 };
}

function estimateRequiredYears(jobText: string): number {
  const normalized = normalizeText(jobText);
  const rangeMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:-|to)\s*(\d+(?:[.,]\d+)?)\s*(?:years?|yrs?|nam)/i);
  if (rangeMatch) return Number(rangeMatch[1].replace(",", "."));

  const plusMatch = normalized.match(/(\d+(?:[.,]\d+)?)\+?\s*(?:years?|yrs?|nam)/i);
  if (plusMatch) return Number(plusMatch[1].replace(",", "."));

  const minimumMatch = normalized.match(/(?:at least|minimum|min\.?|toi thieu)\s*(\d+(?:[.,]\d+)?)\s*(?:years?|yrs?|nam)/i);
  if (minimumMatch) return Number(minimumMatch[1].replace(",", "."));

  return detectSeniority(normalized).years;
}

function extractJobRecord(row: Record<string, unknown>): JobRecord {
  return {
    id: pickText(row, ["id", "job_posting_id", "uuid"]) || crypto.randomUUID(),
    title: pickText(row, ["job_title", "title", "position"]),
    company: pickText(row, ["company_name", "company", "employer"]),
    domain: pickText(row, ["job_industries", "job_function", "domain"]),
    location: pickText(row, ["job_location", "location", "city"]),
    level: pickText(row, ["job_seniority_level", "level", "seniority"]),
    jobSummary: pickText(row, ["job_summary", "jobSummary"]),
    description: pickText(row, ["job_description_formatted", "description", "job_description"]),
    requirements: pickText(row, ["job_summary", "job_description_formatted"]),
    skills: pickText(row, ["job_industries", "job_function", "skills"]),
    url: pickText(row, ["apply_link", "url", "company_url"]),
  };
}

function buildCvText(profile: (ParsedCVProfile & { id: string }) | null): string {
  if (!profile) return "";

  const parts: string[] = [
    profile.fullName,
    profile.jobTitle,
    profile.experienceSummary,
    ...profile.recentPositions.flatMap((position) => [
      position.company,
      position.role,
      position.period,
      position.highlights,
    ]),
    ...profile.education.flatMap((education) => [
      education.institution,
      education.degree,
      education.year,
    ]),
  ];

  return parts.filter(Boolean).join(" ");
}

function buildJobText(job: JobRecord): string {
  return [
    job.title,
    job.company,
    job.domain,
    job.location,
    job.level,
    job.jobSummary,
    job.description,
    job.requirements,
    job.skills,
  ].filter(Boolean).join(" ");
}

function scoreDomainKnowledge(profile: (ParsedCVProfile & { id: string }) | null, job: JobRecord): MatchDimension {
  const cvText = buildCvText(profile);
  const jobText = buildJobText(job);
  const cvTags = extractHintTags(cvText, DOMAIN_HINTS);
  const jobTags = extractHintTags(jobText, DOMAIN_HINTS);
  const matchedTags = intersectOrdered(jobTags, cvTags);
  const missingTags = complementOrdered(jobTags, cvTags);

  const cvKeywords = extractKeywords(cvText, 24);
  const jobKeywords = extractKeywords([job.title, job.domain, job.jobSummary, job.description].filter(Boolean).join(" "), 12);
  const matchedKeywords = intersectOrdered(jobKeywords, cvKeywords);
  const missingKeywords = complementOrdered(jobKeywords, cvKeywords);

  const tagCoverage = jobTags.length > 0 ? matchedTags.length / jobTags.length : 0;
  const keywordCoverage = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0;
  const score = roundScore(2 + (tagCoverage * 4.5) + (keywordCoverage * 3.5));

  const justificationParts: string[] = [];
  if (matchedTags.length > 0) justificationParts.push(`CV và JD cùng nghiêng về domain ${matchedTags.join(", ")}.`);
  if (matchedKeywords.length > 0) justificationParts.push(`Từ khóa nổi bật khớp gồm ${matchedKeywords.slice(0, 4).join(", ")}.`);
  if (missingTags.length > 0) justificationParts.push(`JD còn nhấn mạnh ${missingTags.slice(0, 3).join(", ")} nhưng CV chưa thể hiện rõ.`);
  if (justificationParts.length === 0) justificationParts.push("Mức độ khớp domain ở mức trung bình vì tín hiệu ngành nghề còn mỏng.");

  return {
    score,
    justification: justificationParts.join(" "),
    matchedKeywords: Array.from(new Set([...matchedTags, ...matchedKeywords])).slice(0, 6),
    missingKeywords: Array.from(new Set([...missingTags, ...missingKeywords])).slice(0, 6),
  };
}

function scoreWorkingExperience(profile: (ParsedCVProfile & { id: string }) | null, job: JobRecord): MatchDimension {
  const cvYears = estimateExperienceYears(profile);
  const requiredYears = estimateRequiredYears(buildJobText(job));
  const cvSeniority = detectSeniority(buildCvText(profile));
  const jobSeniority = detectSeniority(buildJobText(job));

  const cvRoles = extractKeywords([profile?.jobTitle || "", ...(profile?.recentPositions || []).map((position) => position.role)].join(" "), 8);
  const jobRoles = extractKeywords([job.title, job.level].filter(Boolean).join(" "), 6);
  const matchedKeywords = intersectOrdered(jobRoles, cvRoles);
  const missingKeywords = complementOrdered(jobRoles, cvRoles);

  let score = 5.5;
  if (requiredYears > 0) {
    if (cvYears >= requiredYears) {
      score = 7 + Math.min(3, (cvYears - requiredYears) * 0.45);
    } else {
      score = 6 - Math.min(4.5, (requiredYears - cvYears) * 1.3);
    }
  } else if (cvYears > 0) {
    score = 5.5 + Math.min(4, cvYears * 0.45);
  }

  if (matchedKeywords.length > 0) score += 0.8;
  if (cvSeniority.tag && jobSeniority.tag && cvSeniority.tag === jobSeniority.tag) score += 0.5;
  score = roundScore(score);

  const justificationParts: string[] = [];
  if (requiredYears > 0) {
    justificationParts.push(`JD đang kỳ vọng khoảng ${requiredYears}+ năm kinh nghiệm, còn CV thể hiện khoảng ${cvYears || 0} năm.`);
  } else {
    justificationParts.push(`JD không nêu rõ số năm yêu cầu, CV thể hiện khoảng ${cvYears || 0} năm kinh nghiệm.`);
  }
  if (cvSeniority.tag && jobSeniority.tag) {
    justificationParts.push(`Mức seniority của CV là ${cvSeniority.tag}, còn job thiên về ${jobSeniority.tag}.`);
  }
  if (matchedKeywords.length > 0) {
    justificationParts.push(`Các vai trò khớp nhất: ${matchedKeywords.slice(0, 3).join(", ")}.`);
  }
  if (missingKeywords.length > 0) {
    justificationParts.push(`Job nhấn mạnh ${missingKeywords.slice(0, 3).join(", ")} nhưng CV chưa có đủ tín hiệu mạnh.`);
  }

  return {
    score,
    justification: justificationParts.join(" "),
    matchedKeywords,
    missingKeywords,
  };
}

function scoreRequirementsOfSkills(profile: (ParsedCVProfile & { id: string }) | null, job: JobRecord): MatchDimension {
  const cvText = buildCvText(profile);
  const jobText = buildJobText(job);
  const cvSkills = extractHintTags(cvText, SKILL_HINTS);
  const jobSkills = extractHintTags(jobText, SKILL_HINTS);
  const matchedSkills = intersectOrdered(jobSkills, cvSkills);
  const missingSkills = complementOrdered(jobSkills, cvSkills);

  const cvKeywords = extractKeywords(cvText, 30);
  const jobKeywords = extractKeywords([job.jobSummary, job.requirements, job.skills, job.description].filter(Boolean).join(" "), 16);
  const matchedKeywords = intersectOrdered(jobKeywords, cvKeywords);
  const missingKeywords = complementOrdered(jobKeywords, cvKeywords);

  const skillCoverage = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
  const keywordCoverage = jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0;
  const score = roundScore(1.5 + (skillCoverage * 5.5) + (keywordCoverage * 3));

  const justificationParts: string[] = [];
  if (matchedSkills.length > 0) {
    justificationParts.push(`CV đã thể hiện các skill nổi bật như ${matchedSkills.slice(0, 4).join(", ")}.`);
  }
  if (jobSkills.length > 0 && missingSkills.length > 0) {
    justificationParts.push(`JD còn yêu cầu thêm ${missingSkills.slice(0, 4).join(", ")}.`);
  }
  if (matchedKeywords.length > 0) {
    justificationParts.push(`Từ khóa khớp nhiều nhất là ${matchedKeywords.slice(0, 4).join(", ")}.`);
  }
  if (justificationParts.length === 0) {
    justificationParts.push("Job và CV có một phần giao nhau về kỹ năng, nhưng chưa đủ dữ kiện để coi là match mạnh.");
  }

  return {
    score,
    justification: justificationParts.join(" "),
    matchedKeywords: Array.from(new Set([...matchedSkills, ...matchedKeywords])).slice(0, 8),
    missingKeywords: Array.from(new Set([...missingSkills, ...missingKeywords])).slice(0, 8),
  };
}

function buildFinalRecommendation(match: JobMatchResult): string {
  const { overallScore, job, requirementsOfSkills, workingExperience } = match;

  if (overallScore >= 8.5) {
    return `Ứng viên là fit mạnh cho vị trí ${job.title || "này"}. Nên ưu tiên apply ngay và tinh chỉnh CV để làm nổi bật các skill và achievement đã match.`;
  }

  if (overallScore >= 7) {
    return `Đây là một match khá tốt cho vị trí ${job.title || "này"}. Có thể apply, nhưng nên nhấn mạnh các keyword còn thiếu như ${requirementsOfSkills.missingKeywords.slice(0, 3).join(", ") || "các yêu cầu nổi bật của JD"}.`;
  }

  if (overallScore >= 5.5) {
    return `Job này ở mức match trung bình. CV đã có nền tảng liên quan, nhưng nên bù thêm kinh nghiệm thực chiến và các skill còn thiếu như ${requirementsOfSkills.missingKeywords.slice(0, 3).join(", ") || "một số requirement chính"}.`;
  }

  return `Job này chưa phải lựa chọn ưu tiên. Nên chỉ apply khi bạn có thể chứng minh thêm kinh nghiệm tương tự hoặc cải thiện nhanh các gap chính về ${workingExperience.missingKeywords.slice(0, 3).join(", ") || "experience"} và ${requirementsOfSkills.missingKeywords.slice(0, 3).join(", ") || "skills"}.`;
}

function buildPrompt(profile: (ParsedCVProfile & { id: string }) | null, matches: JobMatchResult[], locale: Locale): string {
  const profileLines: string[] = [];
  if (profile) {
    profileLines.push(`Full name: ${profile.fullName || "N/A"}`);
    profileLines.push(`Current / target title: ${profile.jobTitle || "N/A"}`);
    profileLines.push(`Experience summary: ${profile.experienceSummary || "N/A"}`);

    if (profile.recentPositions.length > 0) {
      profileLines.push("Recent positions:");
      profile.recentPositions.forEach((position, index) => {
        profileLines.push(`${index + 1}. ${position.role || "N/A"} at ${position.company || "N/A"}${position.period ? ` (${position.period})` : ""}${position.highlights ? ` - ${position.highlights}` : ""}`);
      });
    }

    if (profile.education.length > 0) {
      profileLines.push("Education:");
      profile.education.forEach((education) => {
        profileLines.push(`- ${education.degree || "N/A"} - ${education.institution || "N/A"}${education.year ? ` (${education.year})` : ""}`);
      });
    }
  }

  const jobBlocks = matches.slice(0, 3).map((match, index) => {
    const { job, domainKnowledge, workingExperience, requirementsOfSkills, overallScore } = match;
    const summaryExcerpt = truncateText(job.jobSummary, 260);
    const requirementsExcerpt = truncateText(
      [job.requirements, job.description].filter(Boolean).join(" "),
      260,
    );
    const skillsExcerpt = truncateText(
      [job.skills, job.requirements, job.description].filter(Boolean).join(" "),
      220,
    );
    return [
      `Candidate ${index + 1}:`,
      `- ID: ${job.id}`,
      `- Title: ${job.title || "N/A"}`,
      `- Company: ${job.company || "N/A"}`,
      `- Domain: ${job.domain || "N/A"}`,
      `- Location: ${job.location || "N/A"}`,
      `- Level: ${job.level || "N/A"}`,
      `- Job summary: ${summaryExcerpt || "N/A"}`,
      `- Overall score: ${overallScore}/10`,
      `- Domain keywords: ${domainKnowledge.matchedKeywords.join(", ") || "N/A"}`,
      `- Experience keywords: ${workingExperience.matchedKeywords.join(", ") || "N/A"}`,
      `- Skill keywords: ${requirementsOfSkills.matchedKeywords.join(", ") || "N/A"}`,
      `- Skill gaps: ${requirementsOfSkills.missingKeywords.join(", ") || "N/A"}`,
      `- Requirements excerpt: ${requirementsExcerpt || "N/A"}`,
      `- Skills excerpt: ${skillsExcerpt || "N/A"}`,
    ].join("\n");
  });

  const languageHint = locale === "vi"
    ? "Trả lời bằng tiếng Việt, dùng markdown và chỉ in đậm phần nhãn, không in đậm nội dung mô tả. Hiển thị điểm ngay trong nhãn theo dạng Domain Knowledge (6/10), không viết Score/10. Giữ đúng cấu trúc: Overall Summary, Domain Knowledge, Working Experience, Requirements of Skills, Final Recommendation. Khi có nhiều job, phần Overall Summary phải nêu rõ job nào đứng đầu và khác biệt chính so với các job còn lại. Không được dùng lại một câu văn chung chung cho hai job khác nhau nếu dữ liệu đầu vào khác nhau."
    : "Answer in English, use markdown and bold labels only, not the explanatory body. Put the score inside the label as Domain Knowledge (6/10), not as Score/10. Keep the structure: Overall Summary, Domain Knowledge, Working Experience, Requirements of Skills, Final Recommendation. When multiple jobs are provided, Overall Summary must clearly state which job ranks first and how it differs from the other shortlisted jobs. Do not reuse generic wording across different jobs when the input evidence differs.";

  return [
    "You are a senior career analyst performing evidence-based CV-to-job matching.",
    "Write a concise evaluation anchored on the best-fit job, but make the differences between jobs visible and specific.",
    "Use only the provided information. Do not invent facts or broaden one job into a generic role category.",
    "Do not mention provider names, table names, cache layers, or any internal implementation details.",
    "Treat the supplied job row as the source of truth for a high-stakes career decision. Read fields in this order: job_summary, requirements, skills, description, title. When job_summary contains explicit experience, domain, or skill signals, it must take priority over title and generic description text.",
    "The job blocks include job_summary, normalized keywords, and raw requirement excerpts. Prefer job_summary first when it contains the clearest signals about Kinh nghiệm, Domain, Skill, years of experience, seniority, responsibilities, or tooling. Then use the raw requirement excerpts for confirmation.",
    "Every section must contain at least one concrete signal from the job block or the CV. Avoid template language that could fit any Product Designer, Engineer, or Analyst role.",
    "If two jobs share a title or domain, distinguish them by company, seniority, requirements, skills, or the evidence gaps. Similar scores are allowed; similar wording is not.",
    "If evidence is weak or missing, explicitly say so rather than inflating confidence. For high-stakes decisions, conservative wording is preferred over persuasive wording.",
    "Do not weight the job title alone; the job_summary and requirement keywords are more important when they explicitly mention experience, domain, or skill expectations.",
    "The output must be markdown and follow this exact structure:",
    "- **Overall Summary:**",
    "- **Domain Knowledge (<actual score>/10):** [brief justification]",
    "- **Working Experience (<actual score>/10):** [brief justification]",
    "- **Requirements of Skills (<actual score>/10):** [brief justification]",
    "- **Final Recommendation:**",
    languageHint,
    "If there are multiple candidate jobs, mention the strongest one in Overall Summary and contrast it against the other shortlisted jobs in one short, specific sentence. Do not reuse the same justification text for multiple jobs unless the underlying evidence is genuinely identical.",
    "Avoid generic phrases such as 'phù hợp với vị trí này' unless they are immediately followed by the exact company, title, requirement, or skill evidence supporting that claim.",
    "",
    "CV:",
    ...profileLines,
    "",
    "Candidate Jobs:",
    ...jobBlocks,
  ].join("\n");
}

function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncateText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function cleanAssessmentRemainder(text: string): string {
  let result = text.trim();

  while (/^(?:[\s*_:()\-–—]|(?:\*\*)|(?:__))+/u.test(result)) {
    result = result.replace(/^(?:[\s*_:()\-–—]|(?:\*\*)|(?:__))+/u, "").trim();
  }

  return result.replace(/\s{2,}/g, " ").trim();
}

function normalizeAssessmentMarkdown(markdown: string): string {
  const sections = [
    "Overall Summary",
    "Domain Knowledge",
    "Working Experience",
    "Requirements of Skills",
    "Final Recommendation",
  ];

  const lines = stripCodeFences(markdown)
    .replace(/\r\n/g, "\n")
    .split("\n");

  const normalized = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";

    for (const section of sections) {
      const prefix = new RegExp(`^(?:[-*]\\s*)?(?:\\*\\*)?${escapeRegExp(section)}(?:\\*\\*)?`, "i");
      if (!prefix.test(trimmed)) continue;

      let remainder = trimmed.replace(prefix, "").trim();
      remainder = remainder.replace(/^[:\-–—\s]+/, "").trim();

      if (section === "Domain Knowledge" || section === "Working Experience" || section === "Requirements of Skills") {
        remainder = remainder.replace(/^\(Score\/10\)\s*[:\-–—\s]*/i, "").trim();
        const scoreMatch = remainder.match(/(\d+(?:\.\d+)?)\/10/);
        const score = scoreMatch?.[1] || "";

        if (scoreMatch) {
          remainder = remainder.replace(scoreMatch[0], "").replace(/^[:\-–—\s]+/, "").trim();
        }

        remainder = cleanAssessmentRemainder(remainder);

        const label = score ? `${section} (${score}/10)` : section;
        return remainder ? `- **${label}:** ${remainder}` : `- **${label}:**`;
      }

      remainder = cleanAssessmentRemainder(remainder);
      return remainder ? `- **${section}:** ${remainder}` : `- **${section}:**`;
    }

    return line;
  });

  return normalized.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildNoResultsFallbackMarkdown(profile: (ParsedCVProfile & { id: string }) | null, locale: Locale): string {
  const summary = profile
    ? (locale === "vi"
        ? "Đã hiển thị hết các job phù hợp với bạn."
        : "All matching jobs have been shown.")
    : (locale === "vi"
        ? "Chưa có việc làm nào để so sánh."
        : "No jobs are available to compare against.");

  const recommendation = profile
    ? (locale === "vi"
        ? "Xem lại lịch sử jobs đã gợi ý trước đó hoặc cập nhật CV để mở thêm cơ hội mới."
        : "Review previously recommended jobs or update your CV to unlock more opportunities.")
    : (locale === "vi"
        ? "Hãy thêm việc làm rồi chạy lại phân tích."
        : "Add jobs and run the analysis again.");

  return [
    "- **Overall Summary:**",
    summary,
    "- **Domain Knowledge (0/10):** Không còn job mới phù hợp để so sánh.",
    "- **Working Experience (0/10):** Không còn job mới phù hợp để so sánh.",
    "- **Requirements of Skills (0/10):** Không còn job mới phù hợp để so sánh.",
    `- **Final Recommendation:**\n${recommendation}`,
  ].join("\n");
}

function buildFallbackMarkdown(profile: (ParsedCVProfile & { id: string }) | null, matches: JobMatchResult[], locale: Locale): string {
  const top = matches[0];
  if (!top) {
    return buildNoResultsFallbackMarkdown(profile, locale);
  }

  const summary = locale === "vi"
    ? `Tôi đã đối chiếu CV${profile?.fullName ? ` của ${profile.fullName}` : ""} với ${matches.length} việc làm. Việc làm khớp nhất hiện tại là ${top.job.title || "việc làm đầu tiên"}${top.job.company ? ` tại ${top.job.company}` : ""}.`
    : `I compared the CV${profile?.fullName ? ` for ${profile.fullName}` : ""} against ${matches.length} jobs. The strongest current match is ${top.job.title || "the first job"}${top.job.company ? ` at ${top.job.company}` : ""}.`;

  const shortlist = matches.slice(0, 3).map((match) => `${match.job.title || "Untitled"}${match.job.company ? ` - ${match.job.company}` : ""} (${match.overallScore}/10)`).join(", ");

  return [
    "- **Overall Summary:**",
    `${summary}${shortlist ? ` Shortlist: ${shortlist}.` : ""}`,
    `- **Domain Knowledge (${top.domainKnowledge.score}/10):** ${top.domainKnowledge.justification}`,
    `- **Working Experience (${top.workingExperience.score}/10):** ${top.workingExperience.justification}`,
    `- **Requirements of Skills (${top.requirementsOfSkills.score}/10):** ${top.requirementsOfSkills.justification}`,
    `- **Final Recommendation:**\n${top.finalRecommendation}`,
  ].join("\n");
}

async function generateAnalysisMarkdown(
  profile: (ParsedCVProfile & { id: string }) | null,
  matches: JobMatchResult[],
  locale: Locale,
): Promise<{ markdown: string; providerLabel?: string; usage: AiTokenUsage | null }> {
  const deepseekKey = getDeepseekApiKey();
  const dashscopeKey = getDashscopeApiKey();

  const attempts: ProviderAttempt[] = [];
  if (deepseekKey) {
    attempts.push({
      provider: "deepseek",
      label: "AI backup",
      baseUrl: "https://api.deepseek.com",
      apiKey: deepseekKey,
      model: "deepseek-chat",
    });
  }
  if (dashscopeKey) {
    attempts.push({
      provider: "dashscope",
      label: "Alibaba DashScope",
      baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      apiKey: dashscopeKey,
      model: "qwen-plus",
    });
  }

  if (attempts.length === 0) {
    return { markdown: buildFallbackMarkdown(profile, matches, locale), usage: null };
  }

  const prompt = buildPrompt(profile, matches, locale);
  const systemPrompt = locale === "vi"
    ? "Bạn là chuyên gia phân tích CV và jobs matching. Chỉ được dựa trên dữ liệu được cung cấp để đưa ra đánh giá. Không được viết kiểu template chung cho mọi job. Mỗi nhận định phải bám vào đúng job đang xét, nêu rõ company, title, seniority, requirement hoặc skill gap cụ thể. Khi có nhiều job, phải phân biệt chúng bằng bằng chứng, không được lặp cùng một câu cho các job khác nhau. Đọc theo thứ tự ưu tiên: job_summary, requirements, skills, description, title. Đặc biệt chú ý keyword về Kinh nghiệm, Domain, Skill, years of experience, seniority và responsibilities. Vì đây là đánh giá ảnh hưởng đến quyết định nghề nghiệp, hãy thận trọng hơn là lạc quan. Không được chèn dấu **, (), ():** hoặc các marker markdown rác vào phần nội dung sau nhãn."
    : "You are an expert CV and job matching analyst. Only use the supplied data to produce the assessment. Do not write generic template language that could fit any job. Every judgment must anchor to the exact job being discussed and cite concrete evidence such as company, title, seniority, requirements, or skill gaps. Read fields in this order: job_summary, requirements, skills, description, title. Pay special attention to keywords about experience, domain, skill, years of experience, seniority, and responsibilities. Because this is career decision support, be conservative rather than optimistic when evidence is incomplete. Do not inject stray markdown markers such as **, (), or ():** into the body text after the labels.";

  try {
    const { response, provider } = await requestCompatibleCompletionWithFallback(
      attempts,
      () => ({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.15,
        max_tokens: 1200,
        stream: false,
      }),
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${provider.label} returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    const usage = normalizeTokenUsage(payload.usage);
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return {
        markdown: normalizeAssessmentMarkdown(content),
        providerLabel: provider.label,
        usage,
      };
    }

    return {
      markdown: normalizeAssessmentMarkdown(buildFallbackMarkdown(profile, matches, locale)),
      providerLabel: provider.label,
      usage,
    };
  } catch (error) {
    console.log(`[job-matcher] AI analysis failed: ${error}`);
  }

  return { markdown: normalizeAssessmentMarkdown(buildFallbackMarkdown(profile, matches, locale)), usage: null };
}

function scoreAllJobsAgainstProfile(
  profile: (ParsedCVProfile & { id: string }) | null,
  jobs: Record<string, unknown>[],
): JobMatchResult[] {
  return jobs
    .map((row) => extractJobRecord(row))
    .filter((job) => Boolean(job.title || job.description || job.requirements || job.skills))
    .map((job) => {
      const domainKnowledge = scoreDomainKnowledge(profile, job);
      const workingExperience = scoreWorkingExperience(profile, job);
      const requirementsOfSkills = scoreRequirementsOfSkills(profile, job);
      const overallScore = roundScore((domainKnowledge.score + workingExperience.score + requirementsOfSkills.score) / 3);

      const match: JobMatchResult = {
        job,
        overallScore,
        domainKnowledge,
        workingExperience,
        requirementsOfSkills,
        finalRecommendation: "",
      };

      match.finalRecommendation = buildFinalRecommendation(match);
      return match;
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

/** Score and rank jobs against a profile without calling LLM analysis (for chat context injection). */
export function scoreAndFilterJobMatches(input: {
  profile: (ParsedCVProfile & { id: string }) | null;
  jobs: Record<string, unknown>[];
  minScore?: number;
  maxMatches?: number;
}): JobMatchResult[] {
  const minScore = input.minScore ?? 5;
  const maxMatches = input.maxMatches ?? 10;
  const scored = scoreAllJobsAgainstProfile(input.profile, input.jobs);
  return scored.filter((match) => match.overallScore > minScore).slice(0, maxMatches);
}

/** Guest / no-CV account: surface recent jobs without CV-based scoring. */
export function sliceJobsForGuestBrowse(
  jobs: Record<string, unknown>[],
  maxItems: number,
): JobRecord[] {
  const cap = Math.max(1, Math.min(maxItems, 30));
  return jobs
    .map((row) => extractJobRecord(row))
    .filter((job) => Boolean(job.title || job.description || job.requirements || job.skills))
    .slice(0, cap);
}

export async function buildJobRecommendations(input: {
  profile: (ParsedCVProfile & { id: string }) | null;
  jobs: Record<string, unknown>[];
  locale: Locale;
}): Promise<JobRecommendationResponse> {
  const { locale } = input;

  const scored = scoreAllJobsAgainstProfile(input.profile, input.jobs);

  const topMatches = scored.filter((match) => match.overallScore > 5).slice(0, 10);
  const analysis = topMatches.length > 0
    ? await generateAnalysisMarkdown(input.profile, topMatches, input.locale)
    : { markdown: normalizeAssessmentMarkdown(buildNoResultsFallbackMarkdown(input.profile, input.locale)), usage: null };
  const bestMatch = topMatches[0] ?? null;

  const overallSummary = bestMatch
    ? (locale === "vi"
        ? `Phù hợp nhất: ${bestMatch.job.title || "Chưa có tiêu đề"}${bestMatch.job.company ? ` tại ${bestMatch.job.company}` : ""} (${bestMatch.overallScore}/10).`
        : `Best fit: ${bestMatch.job.title || "Untitled"}${bestMatch.job.company ? ` at ${bestMatch.job.company}` : ""} (${bestMatch.overallScore}/10).`)
    : (locale === "vi" ? "Không tìm thấy job phù hợp." : "No matching jobs were found.");

  return {
    profile: input.profile,
    matches: topMatches,
    bestMatch,
    overallSummary,
    analysisMarkdown: analysis.markdown,
    generatedAt: new Date().toISOString(),
    totalJobsAnalyzed: scored.length,
    providerLabel: analysis.providerLabel,
    usage: analysis.usage,
  };
}
