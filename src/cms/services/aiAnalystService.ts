import type {
  AnalyticsOverview,
  ChannelStat,
  TopLinkStat,
  AnalyticsTimeRange,
} from '../repositories/analyticsRepository';

export interface AiInsightCard {
  id: string;
  type: 'driver' | 'friction' | 'recommendation';
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  badgeColor: string;
  actionableText?: string;
  actionableFix?: string;
  metricHighlight?: string;
}

export interface AiInsightDeck {
  driver: AiInsightCard;
  friction: AiInsightCard;
  recommendation: AiInsightCard;
  recruiterHealthScore: number;
  executiveSummary: string;
}

/**
 * Heuristic AI Analyst Engine
 * Generates deterministic, zero-latency executive intelligence from real analytics metrics.
 */
export function generateAiInsights(
  overview: AnalyticsOverview,
  channels: ChannelStat[],
  topLinks: TopLinkStat[]
): AiInsightDeck {
  const total = overview.totalClicks;
  const activeLinks = topLinks.filter((l) => l.is_active);
  const dormantLinks = activeLinks.filter((l) => l.clicks_count === 0);

  // ─── Scenario 1: Fresh / Zero-Click State ───
  if (total === 0) {
    return {
      driver: {
        id: 'driver-zero',
        type: 'driver',
        title: 'Hệ thống Sẵn sàng Thu thập Dữ liệu Thực',
        subtitle: 'Baseline 0 Clicks • Đã làm sạch toàn bộ dữ liệu mock',
        description:
          'Toàn bộ bộ đếm đã được reset về số 0 thực tế. Hệ thống Edge Function và Client Router đã kích hoạt cơ chế đếm tự động theo thời gian thực.',
        tag: 'Clean Baseline',
        badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
        metricHighlight: '0 Real Clicks',
      },
      friction: {
        id: 'friction-zero',
        type: 'friction',
        title: 'Chưa có Lưu lượng Truy cập Thật',
        subtitle: 'Toàn bộ liên kết đang chờ kích hoạt',
        description:
          'Hiện chưa phát hiện lượt click nào từ các chiến dịch. Các kênh chính như LinkedIn, Zalo và Recruiter Email chưa được phân phối ra ngoài.',
        tag: 'Pending Distribution',
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        actionableFix: 'Copy shortlink /r/linkedin hoặc /r/cv để bắt đầu chia sẻ.',
      },
      recommendation: {
        id: 'rec-zero',
        type: 'recommendation',
        title: 'Kích hoạt Kênh Tuyển dụng Trọng tâm',
        subtitle: 'Ưu tiên chia sẻ /r/linkedin và /r/recruiter_email',
        description:
          'Để tối ưu điểm Recruiter Intent, hãy gắn link /r/linkedin vào bio cá nhân và đính kèm link /r/cv vào hồ sơ PDF ứng tuyển.',
        tag: 'High Priority',
        badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        actionableText: 'Tạo chiến dịch tuyển dụng đầu tiên trong tab UTM & Distribution.',
      },
      recruiterHealthScore: 0,
      executiveSummary:
        'Hệ thống phân tích đang ở trạng thái chuẩn bị ban đầu. Sau khi chia sẻ các shortlink /r/:slug ra các kênh, AI sẽ tự động phân tích hành vi của nhà tuyển dụng và đưa ra dự báo chuyển đổi cụ thể.',
    };
  }

  // ─── Scenario 2: Active Real Data Analysis ───
  // 1. Determine Key Driver
  const topCh = channels[0] || { name: 'Direct', clicks: 0, percentage: 0 };
  const driverCard: AiInsightCard = {
    id: 'driver-active',
    type: 'driver',
    title: `${topCh.name} là Động lực Tăng trưởng Chính`,
    subtitle: `${topCh.clicks} clicks • Chiếm ${topCh.percentage}% tổng lưu lượng`,
    description: `Kênh ${topCh.name} đang mang lại tỷ lệ phản hồi cao nhất trong giai đoạn này. Lưu lượng từ nguồn này cho thấy thông điệp và vị trí đặt liên kết đang hoạt động rất hiệu quả.`,
    tag: 'Top Performing',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    metricHighlight: `${topCh.percentage}% Volume`,
  };

  // 2. Identify Friction / Bottlenecks
  let frictionCard: AiInsightCard;
  if (dormantLinks.length > 0 && dormantLinks.length >= activeLinks.length / 2) {
    frictionCard = {
      id: 'friction-dormant',
      type: 'friction',
      title: `${dormantLinks.length} Liên kết Đang "Ngủ đông" (0 Clicks)`,
      subtitle: 'Tài nguyên phân phối chưa được tận dụng',
      description: `Có ${dormantLinks.length}/${activeLinks.length} liên kết chưa từng nhận được lượt click nào (ví dụ: ${dormantLinks.slice(0, 2).map((l) => `/r/${l.slug}`).join(', ')}).`,
      tag: 'Distribution Gap',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      actionableFix: 'Thử kiểm tra lại vị trí đặt link hoặc gỡ bỏ các preset không còn sử dụng.',
    };
  } else if (overview.deviceSplit.mobilePct >= 65) {
    frictionCard = {
      id: 'friction-mobile-bias',
      type: 'friction',
      title: 'Lưu lượng Truy cập Đa số từ Thiết bị Di động',
      subtitle: `${overview.deviceSplit.mobilePct}% người xem dùng Mobile`,
      description:
        'Phần lớn người xem đang duyệt portfolio trên smartphone. Các dự án cần đảm bảo tải ảnh nhanh, cỡ chữ dễ đọc và giao diện tương tác một tay tiện lợi.',
      tag: 'UX Attention',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      actionableFix: 'Ưu tiên kiểm thử giao diện điện thoại và đảm bảo PDF mở nhanh.',
    };
  } else {
    frictionCard = {
      id: 'friction-channel-balance',
      type: 'friction',
      title: 'Lưu lượng Đang Phụ thuộc vào 1 Kênh Đơn lẻ',
      subtitle: `${topCh.percentage}% tập trung tại ${topCh.name}`,
      description:
        'Sự phụ thuộc lớn vào một kênh phân phối duy nhất có thể bỏ lỡ các nhà tuyển dụng cấp cao hoạt động chủ yếu qua Email trực tiếp hoặc Zalo.',
      tag: 'Diversification',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      actionableFix: 'Mở rộng tiếp cận qua kênh Email cá nhân hoặc mã QR tại sự kiện.',
    };
  }

  // 3. Formulate Actionable Recommendation (Next-Best-Action)
  let recCard: AiInsightCard;
  const recruiterClicks = (channels.find((c) => c.source === 'recruiter_email')?.clicks || 0) +
    (channels.find((c) => c.source === 'cv')?.clicks || 0);

  if (recruiterClicks === 0) {
    recCard = {
      id: 'rec-recruiter-boost',
      type: 'recommendation',
      title: 'Gia tăng Tiếp cận Tuyển dụng Trực tiếp',
      subtitle: 'Mục tiêu: Đạt 5 lượt click từ Email / CV PDF',
      description:
        'Hiện tại chưa ghi nhận click trực tiếp từ email nhà tuyển dụng hoặc link trong CV PDF. Điểm Recruiter Intent sẽ tăng vọt nếu bạn bổ sung link /r/recruiter_email vào thư ứng tuyển.',
      tag: 'Next Best Action',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      actionableText: 'Gửi link /r/recruiter_email trong đợt apply tiếp theo.',
    };
  } else {
    recCard = {
      id: 'rec-double-down',
      type: 'recommendation',
      title: 'Nhân đôi Hiệu quả từ Kênh Dẫn đầu',
      subtitle: `Tập trung tối ưu phễu chuyển đổi cho ${topCh.name}`,
      description: `Với ${topCh.clicks} lượt click đang dẫn đầu từ ${topCh.name}, hãy tạo các bài đăng chuyên sâu dẫn trực tiếp về các bài viết tâm đắc như "The Agent Handoff Problem" để gia tăng thời lượng đọc.`,
      tag: 'Scale Traction',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      actionableText: 'Tạo link UTM mới trỏ đến bài viết Agent Handoff.',
    };
  }

  // Executive Summary text
  const executiveSummary = `Tổng cộng ${total} lượt click thực tế được ghi nhận. Kênh dẫn đầu là ${topCh.name} (${topCh.percentage}% thị phần). Tỷ lệ thiết bị phân bổ ${overview.deviceSplit.desktopPct}% Desktop và ${overview.deviceSplit.mobilePct}% Mobile. Điểm Recruiter Intent đạt mức ${overview.recruiterIntentScore}/100 (${overview.recruiterIntentTier}). Đề xuất trọng tâm: ${recCard.title}.`;

  return {
    driver: driverCard,
    friction: frictionCard,
    recommendation: recCard,
    recruiterHealthScore: overview.recruiterIntentScore,
    executiveSummary,
  };
}

/**
 * Formats a rich Markdown executive report for copying or sharing
 */
export function generateExecutiveMarkdownReport(
  overview: AnalyticsOverview,
  channels: ChannelStat[],
  topLinks: TopLinkStat[],
  range: AnalyticsTimeRange
): string {
  const insights = generateAiInsights(overview, channels, topLinks);
  const dateStr = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# Báo cáo Phân tích Chiến lược Tuyển dụng & Lưu lượng (AI Executive Report)
*Thời gian tạo: ${dateStr} | Phạm vi: ${range.toUpperCase()}*

---

### 1. Tóm lược Điều hành (Executive Summary)
${insights.executiveSummary}

### 2. Các Chỉ số Then chốt (Key Performance Indicators)
- **Tổng Lượt Click Thực**: ${overview.totalClicks}
- **Số Liên kết Hoạt động**: ${overview.activeLinksCount}/${overview.totalLinksCount}
- **Điểm Tiềm năng Tuyển dụng (Recruiter Intent Score)**: ${overview.recruiterIntentScore}/100 (${overview.recruiterIntentTier})
- **Tỷ lệ Thiết bị**: Desktop ${overview.deviceSplit.desktopPct}% | Mobile ${overview.deviceSplit.mobilePct}%

### 3. Phân bổ theo Kênh Tiếp cận (Channel Breakdown)
${channels.map((c) => `- **${c.name}**: ${c.clicks} clicks (${c.percentage}%)`).join('\n')}

### 4. Đánh giá Trí tuệ Nhân tạo (AI Insights & Next-Best-Action)
1. **Động lực Tăng trưởng**: ${insights.driver.title} (${insights.driver.subtitle})
   - *Phân tích*: ${insights.driver.description}
2. **Điểm nghẽn Cần Khắc phục**: ${insights.friction.title}
   - *Khuyến nghị*: ${insights.friction.actionableFix || insights.friction.description}
3. **Hành động Chiến lược Tiếp theo**: ${insights.recommendation.title}
   - *Chi tiết*: ${insights.recommendation.description}

---
*Báo cáo được tạo tự động bởi AI Analyst Engine — Portfolio CMS.*
`;
}
