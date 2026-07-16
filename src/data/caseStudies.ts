

export interface Stat {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string; // We'll map string to icons in the components
}

export interface Challenge {
  title: string;
  description: string;
  solution: string;
}

export interface CaseStudyData {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  logoImage?: string;
  projectUrl?: string;
  projectUrlText?: string;
  stats: Stat[];
  about: {
    title: string;
    description: string[];
  };
  challenges: Challenge[];
  features: Feature[];
  techStack?: string[];
  gallery?: { src: string; alt: string; caption?: string }[];
  conclusion?: {
    title: string;
    description: string[];
  };
}

export const cryptomapData: CaseStudyData = {
  id: 'cryptomap',
  title: 'CryptoMap360',
  subtitle: 'Kết nối các location chấp nhận Crypto toàn cầu',
  heroImage: '/images/case-study/cryptomap_hero_1782502365933.png',
  heroImageAlt: 'Cyberpunk Map Background',
  logoImage: '/assets/cryptomap360-thumbnail.png',
  projectUrl: 'https://cryptomap360.com/',
  projectUrlText: 'Mở CryptoMap360',
  stats: [
    { label: 'Địa điểm', value: 200, prefix: '+' },
    { label: 'Requests/tháng', value: 8680, suffix: 'K' },
    { label: 'LCP (Tốc độ)', value: 3.3, suffix: 's' },
    { label: 'INP (Tương tác)', value: 170, suffix: 'ms' },
    { label: 'SEO Score', value: 80, suffix: '/100' },
  ],
  about: {
    title: 'Tổng quan dự án',
    description: [
      'CryptoMap360 là một nền tảng bản đồ tương tác toàn cầu, giúp người dùng tìm kiếm và khám phá các địa điểm chấp nhận thanh toán bằng tiền điện tử.',
      'Sứ mệnh của dự án là thúc đẩy sự chấp nhận tiền điện tử trong đời sống thực bằng cách tạo ra một cầu nối dễ dàng giữa người dùng Crypto và các doanh nghiệp.'
    ]
  },
  challenges: [
    {
      title: 'Tối ưu hóa dữ liệu bản đồ',
      description: 'Hiển thị hàng ngàn điểm POI (Point of Interest) trên bản đồ mà không làm giảm khung hình (FPS) trên trình duyệt di động.',
      solution: 'Sử dụng Supercluster để gom nhóm dữ liệu (clustering) ở level client-side, kết hợp với WebGL rendering của Mapbox.'
    },
    {
      title: 'Real-time Updates',
      description: 'Dữ liệu địa điểm và trạng thái xác minh cần được cập nhật liên tục mà không bắt người dùng tải lại trang.',
      solution: 'Sử dụng Server-Sent Events (SSE) để đẩy các thay đổi từ server xuống client theo thời gian thực.'
    }
  ],
  features: [
    {
      title: 'Bản đồ Tương tác',
      description: 'Tìm kiếm, lọc và xem chi tiết hàng ngàn địa điểm chấp nhận Crypto trên toàn thế giới.'
    },
    {
      title: 'Xác thực Cộng đồng',
      description: 'Cơ chế crowdsourcing cho phép người dùng thêm, sửa đổi và xác minh các địa điểm mới.'
    },
    {
      title: 'Mobile First',
      description: 'Giao diện tối ưu hoàn toàn cho thiết bị di động, mượt mà như một ứng dụng Native.'
    }
  ]
};

export const vlinkpayData: CaseStudyData = {
  id: 'vlinkpay',
  title: 'VLINKPAY',
  subtitle: 'Minh bạch dòng tiền',
  heroImage: '',
  heroImageAlt: '',
  projectUrl: 'https://www.figma.com/design/upTvpWOIHNFC8Vzqf4AJ3f/Program-Hub--Copy-?node-id=52-11225',
  projectUrlText: 'Mở Figma Gói IOU',
  stats: [],
  about: {
    title: 'Tài chính số / Ví điện tử',
    description: [
      'Thiết kế luồng đổi tiền P2P qua điểm giao dịch với mục tiêu minh bạch phí, rõ ràng trạng thái và mang lại sự tin cậy tuyệt đối cho người dùng.'
    ]
  },
  challenges: [
    {
      title: 'Bối cảnh & Bài toán',
      description: 'VLINKPAY là sản phẩm tài chính số tích hợp ví điện tử, thanh toán, đổi tiền P2P và các luồng giao dịch phức tạp giữa người dùng cá nhân và điểm giao dịch (ATM/Merchant).',
      solution: 'Người dùng phải hiểu rõ: Số tiền, phí phát sinh, tổng thanh toán. Phải biết tiền đang ở đâu, trạng thái hiện tại là gì.'
    },
    {
      title: 'Vai trò & Xử lý',
      description: 'Phân tích luồng sản phẩm và mục tiêu giao dịch. Xác định hành trình người dùng và đối tác/ATM tách biệt.',
      solution: 'Thiết kế cấu trúc các bước giao dịch, hiển thị minh bạch phí. Bàn giao với đội sản phẩm/kỹ thuật để giảm thiểu sự mơ hồ về logic xử lý tiền.'
    }
  ],
  features: [
    {
      title: 'Tách bạch Hành động',
      description: 'Tách rõ hành động của người dùng và đối tác/ATM để giảm nhầm lẫn liên quan đến tiền.'
    },
    {
      title: 'Minh bạch Phí',
      description: 'Hiển thị phí và tổng tiền một cách minh bạch, rõ ràng ngay từ bước tạo yêu cầu.'
    },
    {
      title: 'Trạng thái tin cậy',
      description: 'Dùng trạng thái giao dịch rõ: đang chờ, đã tiếp nhận, đã thanh toán, hoàn tất, đã hủy, tranh chấp.'
    }
  ],
  conclusion: {
    title: 'Takeaway - Bài học sản phẩm',
    description: [
      '"VLINKPAY cho thấy khả năng thiết kế luồng tài chính số nơi niềm tin, minh bạch, trạng thái giao dịch và khả năng triển khai là yếu tố quan trọng nhất. Với sản phẩm tài chính, UX không chỉ là làm thao tác nhanh hơn. UX còn là giúp người dùng hiểu rõ tiền đang ở đâu, trạng thái giao dịch là gì, phí bao nhiêu và bước tiếp theo cần làm gì."'
    ]
  }
};
export const nailhubData: CaseStudyData = { id: 'nailhub', title: '', subtitle: '', heroImage: '', heroImageAlt: '', stats: [], about: { title: '', description: [] }, challenges: [], features: [] };
export const nexoraData: CaseStudyData = { id: 'nexora', title: '', subtitle: '', heroImage: '', heroImageAlt: '', stats: [], about: { title: '', description: [] }, challenges: [], features: [] };
export const aiprocessData: CaseStudyData = { id: 'aiprocess', title: '', subtitle: '', heroImage: '', heroImageAlt: '', stats: [], about: { title: '', description: [] }, challenges: [], features: [] };
export const handoffData: CaseStudyData = { id: 'handoff', title: '', subtitle: '', heroImage: '', heroImageAlt: '', stats: [], about: { title: '', description: [] }, challenges: [], features: [] };
export const fintechfitData: CaseStudyData = { id: 'fintechfit', title: '', subtitle: '', heroImage: '', heroImageAlt: '', stats: [], about: { title: '', description: [] }, challenges: [], features: [] };

export const caseStudies = {
  cryptomap: cryptomapData,
  vlinkpay: vlinkpayData,
  nailhub: nailhubData,
  nexora: nexoraData,
  aiprocess: aiprocessData,
  handoff: handoffData,
  fintechfit: fintechfitData,
};
