export interface ProjectData {
  id: string;
  title: string;
  category: string;
  role: string;
  context: string;
  solution: string[];
  results: { label: string; value: string }[];
  x: number;
  y: number;
}

export const CV_PROJECTS: ProjectData[] = [
  {
    id: 'cryptomap',
    title: 'CryptoMap360',
    category: 'AI Builder MVP',
    role: 'Product Designer + AI Builder',
    context: 'Người dùng gặp khó khăn trong việc tìm kiếm các địa điểm hỗ trợ crypto. Thông tin phân mảnh và thiếu tin cậy.',
    solution: [
      'Nghiên cứu nhu cầu tìm kiếm theo loại coin và khu vực',
      'Thiết kế luồng tìm kiếm, bộ lọc nâng cao và hệ thống UI dễ dùng',
      'Định hình cấu trúc dữ liệu địa điểm, tích hợp bản đồ trực quan',
      'Sử dụng AI để tăng tốc prototype, kiểm soát chất lượng UX'
    ],
    results: [
      { label: 'Users', value: '8K+' },
      { label: 'Search Time', value: '-40%' }
    ],
    x: 500, y: 300
  },
  {
    id: 'nailhub',
    title: 'Nailhub.ai',
    category: 'Traditional Workflow',
    role: 'Product Designer / UX-UI Designer',
    context: 'Dự án theo workflow truyền thống từ BA/DOCS. Đòi hỏi làm rõ requirement và flow để giảm sai lệch khi implement.',
    solution: [
      'Phân tích chi tiết tài liệu BA/DOCS',
      'Chuyển đổi requirement thành user flow rõ ràng',
      'Thiết kế các trạng thái dữ liệu: empty, pending, success, error',
      'Chuẩn bị handoff chi tiết cho đội ngũ FE/BE'
    ],
    results: [
      { label: 'Scope', value: 'Rõ ràng' },
      { label: 'Handoff', value: 'Chi tiết' }
    ],
    x: 300, y: 500
  },
  {
    id: 'vlinkpay',
    title: 'VLINKPAY',
    category: 'Tài chính số / Ví điện tử',
    role: 'Product Designer / UX-UI Designer',
    context: 'Luồng tài chính phức tạp yêu cầu sự tin cậy, minh bạch về phí, trạng thái giao dịch rõ ràng.',
    solution: [
      'Tách rõ hành động của người dùng và đối tác/ATM',
      'Hiển thị minh bạch phí, tổng thanh toán',
      'Thiết kế luồng giao dịch, hướng dẫn rõ ràng ở từng bước',
      'Làm rõ các trạng thái: đang chờ, hoàn tất, lỗi, tranh chấp'
    ],
    results: [
      { label: 'Minh bạch', value: 'Cao' },
      { label: 'Trải nghiệm', value: 'An toàn' }
    ],
    x: 700, y: 450
  },
  {
    id: 'nexora',
    title: 'NEXORA',
    category: 'AI Full Workflow MVP',
    role: 'Product Designer + AI Builder',
    context: 'Xây dựng một nền tảng quy trình AI, yêu cầu sự liên kết giữa nhiều màn hình thay vì chỉ tạo màn hình rời rạc.',
    solution: [
      'Xác định hành trình người dùng và primary action',
      'Vẽ flow chuyển tiếp giữa các màn hình',
      'Bổ sung trạng thái: trống, đang tải, thành công, lỗi',
      'Chuẩn hoá component để đảm bảo tính nhất quán'
    ],
    results: [
      { label: 'Workflow', value: 'Liền mạch' },
      { label: 'MVP', value: 'Có hệ thống' }
    ],
    x: 600, y: 650
  },
  {
    id: 'ai-process',
    title: 'AI Product Process',
    category: 'Phương pháp làm việc',
    role: 'Tư duy & Quy trình',
    context: 'Làm thế nào để sử dụng AI tạo giao diện mà không làm hỏng trải nghiệm người dùng?',
    solution: [
      'Sử dụng AI như công cụ tăng tốc, không phải người ra quyết định',
      'Luôn bắt đầu từ mục tiêu kinh doanh và luồng người dùng',
      'Kiểm soát thứ bậc thông tin và tính nhất quán'
    ],
    results: [
      { label: 'Tốc độ', value: 'Nhanh' },
      { label: 'Kiểm soát', value: 'Cao' }
    ],
    x: 800, y: 700
  },
  {
    id: 'handoff',
    title: 'Hệ thống thiết kế',
    category: 'Design System',
    role: 'Tư duy bàn giao',
    context: 'Làm thế nào để thiết kế một lần và dùng được cho mọi màn hình? Làm sao để Frontend dễ code?',
    solution: [
      'Xây dựng các Design Token: Màu sắc, Typography, Spacing',
      'Thiết kế Component với các state rõ ràng',
      'Auto layout và cấu trúc file gọn gàng',
      'Bàn giao thiết kế kèm tài liệu mô tả logic'
    ],
    results: [
      { label: 'Frontend', value: 'Dễ Code' },
      { label: 'Bảo trì', value: 'Tốt' }
    ],
    x: 950, y: 550
  },
  {
    id: 'fintech-fit',
    title: 'Phù hợp Ngân hàng số',
    category: 'Tầm nhìn & Đóng góp',
    role: 'Mục tiêu phỏng vấn',
    context: 'Những yếu tố khiến tôi phù hợp với vị trí Product Designer mảng Fintech / Ngân hàng số.',
    solution: [
      'Sự tập trung vào tính minh bạch và độ tin cậy',
      'Khả năng thiết kế luồng tài chính phức tạp',
      'Mindset hệ thống và sẵn sàng đóng góp cho team'
    ],
    results: [
      { label: 'Bảo mật', value: 'Tin cậy' },
      { label: 'Giao dịch', value: 'Rõ ràng' }
    ],
    x: 850, y: 300
  },
  {
    id: 'dispatch',
    title: 'Dispatch Workflow',
    category: 'AI Architecture',
    role: 'Product Designer + AI Architect',
    context: 'Hệ thống điều phối AI Agent: từ quy trình thủ công đến hệ thống giao việc có kiểm soát.',
    solution: [
      'Phân tích quy trình cũ, xác định điểm gãy (bottleneck)',
      'Thiết kế phân luồng Route A/B/C theo mức độ phức tạp',
      'Xây dựng hệ thống bàn giao thiết kế (Handoff Contract)',
      'Kiểm soát scope và evidence cho từng tác vụ AI'
    ],
    results: [
      { label: 'Tự động hóa', value: 'Cao' },
      { label: 'Kiểm soát', value: 'Chặt' }
    ],
    x: 400, y: 200
  },
  {
    id: 'agent-rules',
    title: 'Agent Rules',
    category: 'AI Governance',
    role: 'AI Workflow Architect',
    context: 'Biến kiến thức ngầm của team thành hệ thống vận hành chuẩn cho AI Agent.',
    solution: [
      'Xây dựng kiến trúc tri thức (.agent-rules)',
      'Phân luồng task theo Micro Task và Full User Story',
      'Thiết kế mô hình Work Item và kiểm soát Issue',
      'Đảm bảo tính liên tục và evidence cho mọi tác vụ'
    ],
    results: [
      { label: 'Tri thức', value: 'Chuẩn hóa' },
      { label: 'AI Agent', value: 'Tự vận hành' }
    ],
    x: 200, y: 400
  }
];

