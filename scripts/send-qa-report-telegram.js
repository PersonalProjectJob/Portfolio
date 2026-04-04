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

const report = `🎨 Stage 2 Visual Update — Feature #4: Member Section

📋 Feature: Cập nhật thiết kế visual (Stage 2)
🔖 Ticket: #4
🌿 Branch: feature/4_them-noi-dung-thanh-vien
📅 Date: 2026-04-04
⏰ Time: 13:05

━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ What's New in Stage 2 (v2.10):

1️⃣ Team Spotlight Section (NEW)
✅ Intro card + Sota Truong & Harry Le cards
✅ Gradient avatars with initials
✅ Bio + skill tags per member
✅ Responsive: Desktop horizontal → Mobile stacked

2️⃣ Visual Design Upgrade
✅ Luminous neumorphism design language
✅ Soft trust gradients (#0B2545 → #4AADE6)
✅ Outer shadows throughout
✅ Rounded corners (24-30px cards)
✅ Gradient-tinted stat & benefit cards

3️⃣ Section Header Redesign
✅ Pill badge "COMMUNITY" (was plain text)
✅ Updated heading: "ambitious job seekers"
✅ New description mentioning "CareerAI"

4️⃣ Stats Cards Redesign
✅ Split value (34px) + label (14px)
✅ Unique gradient tint per card
✅ Multi-line labels (e.g., "Members\\nActive every week")

5️⃣ Testimonials Enhancement
✅ Real quote from "Minh Anh - Frontend Developer @ VNG"
✅ Avatar with initials + gradient
✅ Carousel with prev/next arrows + dots
✅ Larger quote text (28px)

6️⃣ Benefits Grid Update
✅ Specific, actionable copy per benefit
✅ Font-weight 500 (medium)
✅ Unique gradient per card
✅ Icon + title + description layout

━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Files Updated:
• MemberSection.tsx (649 lines — rebuilt)
• useAnimatedCounter.ts (unchanged)
• locales/vi.ts (added teamSpotlight, updated copy)
• locales/en.ts (added teamSpotlight, updated copy)

🎨 Design Tokens Implemented:
├── Gradients: 14 unique (stats, benefits, team, testimonials)
├── Shadows: 5 variants (container, card, avatar, quote)
├── Colors: #0B2545 (primary), #4AADE6 (accent), #5A6475 (muted)
├── Radius: 30px (container), 26-28px (large), 24px (cards)
└── Typography: Inter, clamp() for responsive sizes

━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Responsive Breakpoints:
✅ Desktop (1440px): Full layout, 4-col stats, 3-col benefits
✅ Tablet (900px): 2x2 stats, 2-col benefits, stacked testimonial
✅ Mobile (390px): 2x2 stats, 1-col benefits, no carousel arrows

━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Build Status: PASS
✅ Production build successful (dist/ generated)
✅ Dev server running (localhost:5173)
✅ No TypeScript errors
✅ No linting errors

🐛 Bugs: 0 Critical, 0 High
💡 Notes: Chunk size warning (>500KB) — pre-existing, not from this update`;

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
