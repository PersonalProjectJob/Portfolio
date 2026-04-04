/**
 * Mock Qwen /chat-completions API
 * Simulates streaming responses from an AI Career Advisor
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AI_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Xin chào! Tôi là AI Career Advisor của bạn. Tôi có thể giúp bạn phân tích JD (Job Description), so sánh với CV của bạn, và đưa ra lời khuyên để tối ưu hồ sơ ứng tuyển. Bạn muốn bắt đầu từ đâu?",
    "Chào bạn! Tôi sẵn sàng hỗ trợ bạn trong hành trình tìm việc. Hãy gửi cho tôi JD bạn quan tâm hoặc đặt câu hỏi về career path nhé!",
  ],
  jd_analysis: [
    "Dựa trên JD bạn chia sẻ, đây là phân tích của tôi:\n\n**Yêu cầu chính:**\n- 3+ năm kinh nghiệm React/TypeScript\n- Kiến thức về CI/CD và cloud services\n- Kỹ năng communication tốt\n\n**Điểm mạnh của bạn (match 75%):**\n- Technical skills phù hợp\n- Có kinh nghiệm làm việc nhóm\n\n**Cần cải thiện:**\n- Bổ sung kinh nghiệm cloud (AWS/GCP)\n- Thêm project showcase về performance optimization\n\nBạn muốn tôi gợi ý cách viết lại phần Experience không?",
  ],
  cv_tips: [
    "Để tối ưu CV cho vị trí này, tôi khuyên bạn:\n\n1. **Summary section**: Viết lại theo formula: [Years exp] + [Core skill] + [Industry] + [Key achievement]\n\n2. **Experience**: Dùng format STAR cho mỗi bullet point\n   - Situation → Task → Action → Result\n   - Luôn đính kèm số liệu cụ thể\n\n3. **Skills section**: Ưu tiên keywords từ JD lên đầu\n\n4. **Projects**: Thêm link demo/GitHub nếu có\n\nBạn muốn tôi review phần nào cụ thể trong CV?",
  ],
  salary: [
    "Dựa trên dữ liệu thị trường cho vị trí tương tự:\n\n**Mức lương tham khảo (VNĐ/tháng):**\n- Junior (1-2 năm): 15-25 triệu\n- Mid-level (3-5 năm): 25-45 triệu\n- Senior (5+ năm): 45-70 triệu\n\n**Tips thương lượng:**\n- Research kỹ công ty trước khi đàm phán\n- Đề cập thành tích cụ thể với số liệu\n- Hỏi về benefits package tổng thể\n\nBạn đang target mức nào? Tôi sẽ tư vấn chiến lược phù hợp.",
  ],
  interview: [
    "Đây là những câu hỏi phỏng vấn phổ biến cho vị trí này:\n\n**Technical:**\n1. Giải thích sự khác biệt giữa useMemo và useCallback?\n2. Làm thế nào để optimize performance trong React app lớn?\n3. Mô tả kiến trúc microservices bạn đã triển khai?\n\n**Behavioral:**\n1. Kể về một conflict trong team và cách bạn giải quyết?\n2. Dự án nào bạn tự hào nhất và tại sao?\n\n**Mẹo:** Chuẩn bị 2-3 câu chuyện STAR cho behavioral questions. Bạn muốn tôi mock interview không?",
  ],
  default: [
    "Đó là một câu hỏi hay! Để tôi phân tích chi tiết hơn...\n\nTrong lĩnh vực tuyển dụng tech hiện nay, xu hướng chung là:\n- Công ty ưu tiên practical skills hơn bằng cấp\n- Remote/Hybrid trở thành standard\n- AI skills đang trở thành yêu cầu phổ biến\n\nBạn có thể chia sẻ thêm context để tôi tư vấn cụ thể hơn không?",
    "Tôi hiểu mối quan tâm của bạn. Dựa trên kinh nghiệm tư vấn, tôi khuyên bạn nên:\n\n1. Xác định rõ career goal trong 2-3 năm tới\n2. Tập trung build portfolio thay vì apply số lượng\n3. Network trên LinkedIn với recruiters trong ngành\n\nBạn muốn đi sâu vào phần nào?",
  ],
};

function getResponseCategory(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("xin chào") ||
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("chào")
  ) {
    return "greeting";
  }
  if (
    lower.includes("jd") ||
    lower.includes("job description") ||
    lower.includes("mô tả công việc") ||
    lower.includes("phân tích")
  ) {
    return "jd_analysis";
  }
  if (
    lower.includes("cv") ||
    lower.includes("resume") ||
    lower.includes("hồ sơ")
  ) {
    return "cv_tips";
  }
  if (
    lower.includes("lương") ||
    lower.includes("salary") ||
    lower.includes("thu nhập")
  ) {
    return "salary";
  }
  if (
    lower.includes("phỏng vấn") ||
    lower.includes("interview") ||
    lower.includes("câu hỏi")
  ) {
    return "interview";
  }
  return "default";
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Simulates a streaming chat completion response
 * Calls onChunk with partial text as it "streams"
 */
export async function mockChatCompletion(
  userMessage: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
): Promise<void> {
  const category = getResponseCategory(userMessage);
  const responses =
    AI_RESPONSES[category] || AI_RESPONSES.default;
  const fullResponse =
    responses[Math.floor(Math.random() * responses.length)];

  // Simulate network latency
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 500),
  );

  // Stream character by character with variable speed
  let accumulated = "";
  const words = fullResponse.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = (i === 0 ? "" : " ") + words[i];
    accumulated += word;
    onChunk(accumulated);

    // Variable typing speed: faster for common words, slower for formatting
    const delay =
      word.includes("**") || word.includes("\n")
        ? 80
        : 20 + Math.random() * 40;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  onComplete(fullResponse);
}

export function createUserMessage(
  content: string,
): ChatMessage {
  return {
    id: generateId(),
    role: "user",
    content,
    timestamp: new Date(),
  };
}

export function createAssistantMessage(
  content: string,
): ChatMessage {
  return {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: new Date(),
  };
}

/** Initial welcome message */
export const WELCOME_MESSAGE: ChatMessage = {
  id: "msg_welcome",
  role: "assistant",
  content:
    "Xin chào! Tôi là **AI Career Advisor** - trợ lý tìm việc thông minh của bạn.\n\nTôi có thể giúp bạn:\n- Phân tích JD và so sánh với CV\n- Tư vấn cách viết CV hiệu quả\n- Chuẩn bị cho phỏng vấn\n- Tham khảo mức lương thị trường\n\nHãy bắt đầu bằng cách gửi tin nhắn cho tôi nhé!",
  timestamp: new Date(),
};

/** Quick suggestion chips */
export const QUICK_SUGGESTIONS = [
  "Phân tích JD cho tôi",
  "Tips viết CV",
  "Chuẩn bị phỏng vấn",
  "Tham khảo lương",
];