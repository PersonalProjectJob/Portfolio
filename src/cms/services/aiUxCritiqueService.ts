import type { UxProjectSummary } from '../repositories/uxAnalyticsRepository';

export interface UxCritiqueCard {
  type: 'hook_friction' | 'visual_gap' | 'cognitive_overload';
  title: string;
  severity: 'high' | 'medium' | 'low';
  diagnosis: string;
  recommendation: string;
  actionableFix: string;
}

export interface AiUxCritique {
  projectName: string;
  pageSlug: string;
  generatedAt: number;
  engagementScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  summaryHeadline: string;
  critiques: UxCritiqueCard[];
}

export function generateAiUxCritique(summary: UxProjectSummary): AiUxCritique {
  const { projectName, pageSlug, totalReaders, completionRate, avgDwellSeconds, frictionAlerts, heatMap, readingFunnel } = summary;

  // Base score calculation
  let score = 70;

  // Reading completion bonus/penalty
  if (completionRate >= 50) score += 20;
  else if (completionRate >= 30) score += 10;
  else if (completionRate < 15 && totalReaders > 5) score -= 15;

  // Dwell depth bonus
  if (avgDwellSeconds >= 90) score += 10;
  else if (avgDwellSeconds >= 45) score += 5;
  else if (avgDwellSeconds < 20 && totalReaders > 5) score -= 10;

  // Friction penalty
  const totalFriction = frictionAlerts.reduce((sum, a) => sum + a.occurrences, 0);
  if (totalFriction > 5) score -= 15;
  else if (totalFriction > 0) score -= 5;

  score = Math.max(10, Math.min(98, score));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  const critiques: UxCritiqueCard[] = [];

  // 1. Hook & Drop-off Critique
  const firstDrop = readingFunnel[1] ? readingFunnel[0].readersReached - readingFunnel[1].readersReached : 0;
  const firstDropPct = readingFunnel[0] && readingFunnel[0].readersReached > 0
    ? Math.round((firstDrop / readingFunnel[0].readersReached) * 100)
    : 0;

  if (firstDropPct > 35) {
    critiques.push({
      type: 'hook_friction',
      title: 'Độ hẫng nhận thức đầu trang (Hero-to-Problem Drop)',
      severity: 'high',
      diagnosis: `Có tới ${firstDropPct}% độc giả rời đi ngay sau phần mở đầu mà không cuộn tiếp vào nội dung trọng tâm.`,
      recommendation: 'Hero section đang quá dài hoặc thiếu "Teaser Visual" thôi thúc người đọc khám phá giải pháp.',
      actionableFix: 'Thêm nút "Quick Jump to Prototype" hoặc hiển thị mockup thu nhỏ ngay trên nếp gấp màn hình đầu tiên.',
    });
  } else {
    critiques.push({
      type: 'hook_friction',
      title: 'Điểm neo thị giác mở đầu hiệu quả (High Hook Retention)',
      severity: 'low',
      diagnosis: `Tỷ lệ giữ chân qua nếp gấp mở đầu đạt ${100 - firstDropPct}%, độc giả tiếp nhận tốt bối cảnh dự án.`,
      recommendation: 'Duy trì phong cách mở đầu ngắn gọn, tập trung vào bài toán cốt lõi.',
      actionableFix: 'Tiếp tục duy trì cấu trúc Headline + Impact Metric ngay đầu Case Study.',
    });
  }

  // 2. Cognitive Load & Section Heat Critique
  const hottestSection = [...heatMap].sort((a, b) => b.dwellTimeMs - a.dwellTimeMs)[0];
  const coldestSection = [...heatMap].filter((s) => s.sectionOrder > 0).sort((a, b) => a.dwellTimeMs - b.dwellTimeMs)[0];

  if (hottestSection && hottestSection.avgDwellSeconds > 60) {
    critiques.push({
      type: 'cognitive_overload',
      title: `Tập trung cao độ tại: ${hottestSection.sectionName}`,
      severity: 'medium',
      diagnosis: `Độc giả dừng lại trung bình ${hottestSection.avgDwellSeconds}s tại phần này (chiếm tỷ trọng thời gian cao nhất).`,
      recommendation: 'Đây là thỏi nam châm thu hút sự chú ý. Tuy nhiên nếu thời gian đọc quá lâu, có thể do sơ đồ hoặc mật độ chữ quá dày.',
      actionableFix: 'Bổ sung chú thích tương tác (interactive tooltips) hoặc phân tách thành các khối trực quan dạng Tab.',
    });
  } else if (coldestSection && coldestSection.avgDwellSeconds < 10 && totalReaders > 3) {
    critiques.push({
      type: 'cognitive_overload',
      title: `Phần bị lướt qua nhanh: ${coldestSection.sectionName}`,
      severity: 'medium',
      diagnosis: `Độc giả chỉ dừng lại trung bình ${coldestSection.avgDwellSeconds}s, có dấu hiệu cuộn lướt (skimming).`,
      recommendation: 'Nội dung tại section này có thể đang mang tính lý thuyết hoặc thiếu minh chứng bằng hình ảnh.',
      actionableFix: 'Chuyển đổi các đoạn văn bản dài thành Bullet Checklist hoặc sơ đồ minh họa quy trình.',
    });
  } else {
    critiques.push({
      type: 'cognitive_overload',
      title: 'Nhịp độ thụ cảm cân bằng (Balanced Reading Rhythm)',
      severity: 'low',
      diagnosis: 'Thời gian dừng giữa các section phân bổ đồng đều, không có dấu hiệu ngắt quãng hay tắc nghẽn thông tin.',
      recommendation: 'Độc giả nắm bắt mạch kể chuyện (Storytelling) mạch lạc từ vấn đề đến tác động.',
      actionableFix: 'Giữ nguyên tỷ lệ 40% văn bản - 60% hình ảnh minh họa cho các dự án tiếp theo.',
    });
  }

  // 3. Friction & Interaction Critique
  if (frictionAlerts.length > 0) {
    const topFriction = frictionAlerts[0];
    critiques.push({
      type: 'visual_gap',
      title: `Phát hiện ${topFriction.eventType === 'rage_click' ? 'Rage Click (Nhấp liên tục)' : 'Dead Click'} tại ${topFriction.targetTag}`,
      severity: 'high',
      diagnosis: `Ghi nhận ${topFriction.occurrences} lần người dùng nhấp dồn dập vào "${topFriction.targetText || topFriction.targetSelector}".`,
      recommendation: 'Người dùng kỳ vọng phần tử này có tương tác (phóng to hoặc mở link) nhưng hệ thống không phản hồi.',
      actionableFix: topFriction.suggestedFix,
    });
  } else {
    critiques.push({
      type: 'visual_gap',
      title: 'Trải nghiệm thao tác trơn tru (Zero Friction)',
      severity: 'low',
      diagnosis: 'Không phát hiện bất kỳ Rage Click hay thao tác nhầm lẫn nào từ độc giả.',
      recommendation: 'Các nút bấm và hình ảnh có affordance trực quan và phản hồi mượt mà.',
      actionableFix: 'Duy trì chuẩn hover state và active click scale 0.98 cho toàn bộ UI buttons.',
    });
  }

  const summaryHeadline = score >= 85
    ? `Thiết kế UX của ${projectName} đạt hiệu suất cao với tỷ lệ đọc sâu ${summary.segmentation.deepReaderPct}% và mạch tiếp nhận ấn tượng.`
    : `Case study ${projectName} có nền tảng tốt nhưng cần tối ưu điểm neo thị giác và giảm thiểu các điểm nghẽn tương tác.`;

  return {
    projectName,
    pageSlug,
    generatedAt: Date.now(),
    engagementScore: score,
    grade,
    summaryHeadline,
    critiques,
  };
}

export function generateExecutiveCritiqueMarkdown(critique: AiUxCritique, summary: UxProjectSummary): string {
  const dateStr = new Date(critique.generatedAt).toLocaleString('vi-VN');

  return `# Báo Cáo Phân Tích UX Thực Nghiệm: ${critique.projectName}
**Thời gian xuất:** ${dateStr}  
**Điểm Đánh Giá UX:** \`${critique.engagementScore}/100\` (Xếp loại: **${critique.grade}**)  
**Độc Giả Tiếp Cận:** ${summary.totalReaders} lượt | **Thời Gian Đọc TB:** ${summary.avgDwellSeconds}s | **Tỷ Lệ Hoàn Thành:** ${summary.completionRate}%

---

## 1. Tóm Lược Điều Hành (Executive Summary)
> ${critique.summaryHeadline}

* **Phân khúc độc giả:**
  - ⚡ **Skimmers (Lướt nhanh <30s):** ${summary.segmentation.skimmerPct}%
  - 🔍 **Scanners (Quét tiêu đề 30-90s):** ${summary.segmentation.scannerPct}%
  - 📖 **Deep Readers (Nghiên cứu sâu >90s):** ${summary.segmentation.deepReaderPct}%

---

## 2. Bản Đồ Nhiệt Chú Ý (Section Attention Heatmap)
| Thứ tự | Phần Nội Dung | Thời gian dừng TB | Chỉ số Nhiệt (0-100) | Mức độ chú ý |
|---|---|---|---|---|
${summary.heatMap
  .map(
    (s) =>
      `| ${s.sectionOrder + 1} | ${s.sectionName} | ${s.avgDwellSeconds}s | ${s.heatScore} | **${s.heatLevel.toUpperCase()}** |`
  )
  .join('\n')}

---

## 3. Khuyến Nghị Thiết Kế UX Chi Tiết (Design Critiques)

${critique.critiques
  .map(
    (c, idx) => `### ${idx + 1}. [${c.severity.toUpperCase()}] ${c.title}
* **Chẩn đoán:** ${c.diagnosis}
* **Khuyến nghị:** ${c.recommendation}
* **Hành động cụ thể:** \`${c.actionableFix}\`
`
  )
  .join('\n')}

---
*Báo cáo được biên soạn tự động bởi First-Party Heuristic AI UX Engine (Sota Trương Portfolio).*
`;
}
