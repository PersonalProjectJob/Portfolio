#!/usr/bin/env node

/**
 * Send QA Report for Feature #4 - Member Section to Telegram
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.trim().split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_DEV_THREAD_ID } = envVars;

const report = `🧪 QA Report — Feature #4: Member Section

📋 Feature: Thêm nội dung thành viên
🔖 Ticket: #4
🌿 Branch: feature/4_them-noi-dung-thanh-vien
📅 Date: 2026-04-04
⏰ Time: 12:52

━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Test Results:

1️⃣ Code Quality
✅ Linting: PASS
✅ Frontend Standards: PASS
✅ File Naming: PASS
✅ Import Order: PASS
✅ TypeScript Interfaces: PASS

2️⃣ Build & Deployment
✅ Production Build: PASS
✅ Dev Server: PASS (localhost:5173)
✅ No Runtime Errors: PASS

3️⃣ Functional Testing
✅ Section renders correctly
✅ Statistics animate on scroll
✅ Testimonials carousel works
✅ Benefits grid responsive
✅ i18n VI/EN working

4️⃣ Responsive Design
✅ Mobile: 2-col stats, 1-col benefits
✅ Tablet: 4-col stats, 2-col benefits
✅ Desktop: 4-col stats, 3-col benefits

5️⃣ Accessibility
✅ ARIA labels on controls
✅ Semantic HTML structure
✅ Keyboard navigation support
✅ Color contrast compliant

━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Files Created/Modified:
• MemberSection.tsx (326 lines)
• useAnimatedCounter.ts (56 lines)
• LandingPage.tsx (added import)
• index.html (created entry point)
• src/main.tsx (created entry point)
• package.json (added dev script)

🎨 Components Implemented:
├── SectionHeader (label, heading, desc)
├── StatisticsRow (4 cards + animated counters)
├── TestimonialsCarousel (4 items + navigation)
└── BenefitsGrid (6 cards with Lucide icons)

━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 Bugs Found: 0 Critical, 0 High
💡 Low Priority: 2 items (formatting, avatar placeholder)

━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Recommendation: PASS
Ready for production deployment

✅ All wireframe specs met
✅ Frontend standards followed
✅ i18n complete (VI + EN)
✅ Responsive design verified`;

async function sendReport() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        message_thread_id: TELEGRAM_DEV_THREAD_ID,
        text: report,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ QA Report sent to Telegram successfully!');
      console.log(`📬 Message ID: ${data.result.message_id}`);
    } else {
      console.error('❌ Failed to send report:', data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendReport();
