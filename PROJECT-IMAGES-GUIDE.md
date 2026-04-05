# 📸 Hướng Dẫn Thêm Images Vào Portfolio Projects

## 🎯 Dự Án Đã Được Tạo

✅ **Projects Page** (`/projects`) - Danh sách projects với filters  
✅ **Project Detail Page** (`/projects/:id`) - Chi tiết case study  
✅ **2 Projects:**
   - Caloer Official - Food & Nutrition App
   - CryptoMap 360 - Blockchain Analytics

---

## 📁 Cấu Trúc Images Cần Chuẩn Bị

### 1. **Banner Images** (Cho projects list)

Tạo screenshots từ PDF files:

```
img/
├── caloer-banner.jpg          # Banner cho Caloer project
└── cryptomap-banner.jpg       # Banner cho CryptoMap project
```

**Cách tạo:**
1. Mở file PDF trong trình đọc PDF
2. Chụp màn hình trang đầu tiên (Win + Shift + S)
3. Crop lại tỷ lệ 16:9 hoặc 3:2
4. Lưu với tên file như trên

### 2. **Project Screenshots** (Cho gallery)

Tạo folder và thêm images:

```
public/
└── assets/
    ├── projects/
    │   ├── caloer/
    │   │   ├── research.png        # Research phase image
    │   │   ├── ia.png              # Information Architecture
    │   │   ├── wireframes.png      # Wireframes screenshot
    │   │   ├── final.png           # Final design
    │   │   ├── screen-1.png        # App screen 1
    │   │   ├── screen-2.png        # App screen 2
    │   │   ├── screen-3.png        # App screen 3
    │   │   ├── screen-4.png        # App screen 4
    │   │   ├── screen-5.png        # App screen 5
    │   │   └── screen-6.png        # App screen 6
    │   └── cryptomap/
    │       ├── research.png        # Research phase
    │       ├── architecture.png    # Data architecture
    │       ├── dashboard.png       # Dashboard design
    │       ├── testing.png         # Usability testing
    │       ├── dashboard-1.png     # Dashboard screen 1
    │       ├── dashboard-2.png     # Dashboard screen 2
    │       ├── portfolio.png       # Portfolio tracking
    │       ├── alerts.png          # Alerts feature
    │       ├── mobile-1.png        # Mobile screen 1
    │       └── mobile-2.png        # Mobile screen 2
```

**Kích thước khuyến nghị:**
- Process images: 1200x800px (3:2 ratio)
- Screen images: 800x1600px (mobile) hoặc 1440x900px (desktop)
- Format: PNG cho screenshots, JPG cho photos

---

## 🔄 Cách Update Images

### Option 1: Thay thế placeholder bằng images thật

Mở file `src/app/pages/ProjectsPage.tsx` và `src/app/pages/ProjectDetailPage.tsx`, tìm và thay thế:

**ProjectsPage.tsx - Line ~150:**
```typescript
// THAY ĐỔI:
style={{ 
  height: "280px",
  background: `linear-gradient(135deg, ${project.id === "caloer-official" ? "#A693D6, #8B7CC3" : "#4DB1CE, #2B8DA9"})`,
}}

// THÀNH:
style={{ 
  height: "280px",
  backgroundImage: `url(${project.bannerImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}}
```

**ProjectDetailPage.tsx - Line ~180:**
```typescript
// THAY ĐỔI:
style={{
  background: `linear-gradient(135deg, ${project.id === "caloer-official" ? "#A693D6 0%, #8B7CC3 100%" : "#4DB1CE 0%, #2B8DA9 100%"})`,
}}

// THÀNH:
style={{
  backgroundImage: `url(${project.bannerImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}}
```

### Option 2: Update process & gallery images

Trong cả 2 files, tìm các placeholder:

```typescript
// Process images - tìm dòng có "📸"
<div style={{ fontSize: "48px", marginBottom: "16px" }}>📸</div>

// THAY THÀNH:
<img 
  src={phase.image} 
  alt={phase.title}
  className="w-full h-full object-cover"
/>

// Gallery images - tìm dòng có "🖼️"
<div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>

// THAY THÀNH:
<img 
  src={image} 
  alt={`Screen ${index + 1}`}
  className="w-full h-full object-cover"
/>
```

---

## 📝 Cách Thêm Project Mới

Mở cả 2 files và thêm vào mảng `projects`:

```typescript
{
  id: "ten-project",
  title: "Tên Project Đầy Đủ",
  subtitle: "Loại design",
  category: "UI Design", // hoặc "UX Design", "AI Projects", "Branding"
  bannerImage: "/img/ten-project-banner.jpg",
  description: "Mô tả ngắn về project",
  problem: "Vấn đề cần giải quyết",
  solution: "Giải pháp đã thực hiện",
  role: "Vai trò của bạn",
  timeline: "Thời gian (vd: 3 months)",
  team: "Thành viên team",
  tools: ["Figma", "Tool 1", "Tool 2"],
  process: [
    {
      step: 1,
      title: "Tên phase",
      description: "Mô tả",
      image: "/assets/projects/ten-project/phase1.png"
    },
    // ... thêm phases
  ],
  results: [
    { metric: "Tên metric", value: 100, suffix: "%", improvement: true },
    // ... thêm metrics
  ],
  images: [
    "/assets/projects/ten-project/screen-1.png",
    // ... thêm images
  ],
  liveUrl: "https://url-thuc-te.com"
}
```

---

## 🎨 Customization Tips

### Đổi màu gradient cho project mới

Trong banner style:
```typescript
background: `linear-gradient(135deg, #MAUSAC1 0%, #MAUSAC2 100%)`
```

**Gợi ý màu:**
- Purple: `#A693D6, #8B7CC3`
- Teal: `#4DB1CE, #2B8DA9`
- Orange: `#F5A623, #D4891C`
- Green: `#50E3C2, #41A88B`
- Pink: `#E8567D, #C73E5D`

### Đổi emoji icon cho project

```typescript
{project.id === "caloer-official" ? "🍎" : "₿"}
```

**Icon gợi ý:**
- Food: 🍎 🍔 🥗
- Finance: ₿ 💰 📊
- Health: 💊 🏥 ❤️
- Education: 📚 🎓 ✏️
- E-commerce: 🛒 📦 🏪

---

## 🚀 Build & Deploy

Sau khi thêm images:

```bash
# Build
npm run build

# Test production build
npm run preview

# Deploy (tùy thuộc vào platform)
# Vercel: vercel deploy
# Netlify: netlify deploy
# GitHub Pages: push to gh-pages branch
```

---

## ✅ Checklist Khi Thêm Project Mới

- [ ] Chụp banner từ PDF/Figma
- [ ] Crop banner đúng tỷ lệ (16:9 hoặc 3:2)
- [ ] Lưu banner vào `img/` folder
- [ ] Chụp process images (4 phases)
- [ ] Chụp screenshots (6+ screens)
- [ ] Resize images đúng kích thước
- [ ] Update paths trong code
- [ ] Test local với `npm run dev`
- [ ] Build thử với `npm run build`
- [ ] Commit và push

---

## 📞 Cần Trợ Giúp?

Nếu cần:
- Convert PDF sang images: Dùng `pdf2image` hoặc online tools
- Resize hàng loạt: Dùng `ImageMagick` hoặc Photoshop Actions
- Optimize images: Dùng `TinyPNG` hoặc `Squoosh`

**Current Status:** ✅ Code đã sẵn sàng, chỉ cần thêm images!
