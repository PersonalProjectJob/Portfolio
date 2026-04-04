/**
 * Send Changelog to Telegram
 * 
 * This script formats and sends changelog/update summaries to Telegram.
 * Used for notifying admin about major code changes, releases, or deployments.
 * 
 * Usage:
 * node scripts/send-changelog.js
 * 
 * Environment variables (from .env):
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 * - TELEGRAM_CHANGELOG_THREAD_ID (optional)
 * 
 * Optional arguments:
 * - --title "Custom Title" (default: "📦 Changelog Update")
 * - --version "1.2.3" (default: from package.json)
 * - --changes "line1\nline2\nline3" (required)
 * - --category "feature|fix|security|deployment|breaking" (default: "update")
 * 
 * Examples:
 * node scripts/send-changelog.js --title "🚀 New Feature" --changes "Added AI chat\nImproved UI"
 * node scripts/send-changelog.js --version "2.0.0" --category "breaking" --changes "Changed API\nRemoved legacy"
 * node scripts/send-changelog.js --category "security" --changes "Fixed CORS\nAdded auth"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .forEach(line => {
      const [key, ...valueParts] = line.split('=');
      process.env[key.trim()] = valueParts.join('=').trim();
    });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    title: '📦 Changelog Update',
    version: null,
    changes: '',
    category: 'update',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--title':
        parsed.title = args[++i];
        break;
      case '--version':
        parsed.version = args[++i];
        break;
      case '--changes':
        parsed.changes = args[++i];
        break;
      case '--category':
        parsed.category = args[++i];
        break;
    }
  }

  return parsed;
}

// Get category emoji
function getCategoryEmoji(category) {
  const emojis = {
    feature: '✨',
    fix: '🐛',
    security: '🔒',
    deployment: '🚀',
    breaking: '⚠️',
    update: '📝',
    performance: '⚡',
    docs: '📚',
    test: '🧪',
    refactor: '♻️',
  };
  return emojis[category] || '📝';
}

// Get version from package.json
function getVersionFromPackage() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

async function sendChangelog() {
  const args = parseArgs();
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const telegramThreadId = process.env.TELEGRAM_CHANGELOG_THREAD_ID;

  if (!telegramBotToken || !telegramChatId) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    process.exit(1);
  }

  if (!args.changes) {
    console.error("❌ Missing --changes argument");
    console.log("Usage: node scripts/send-changelog.js --changes 'line1\\nline2'");
    process.exit(1);
  }

  const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const version = args.version || getVersionFromPackage();
  const categoryEmoji = getCategoryEmoji(args.category);

  // Format changes list
  const changesList = args.changes
    .split('\\n')
    .filter(line => line.trim())
    .map(line => `  • ${line.trim()}`)
    .join('\n');

  const message = `${categoryEmoji} <b>${args.title}</b>
📅 <b>Date:</b> ${now}
📦 <b>Version:</b> ${version}
🏷️ <b>Category:</b> ${args.category.toUpperCase()}

<b>Changes:</b>
${changesList}

━━━━━━━━━━━━━━━━━━━━
🤖 Job360 Auto-Notification`;

  // Try with thread ID first, fall back to without
  const messageThreadId = telegramThreadId ? parseInt(telegramThreadId) : undefined;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          message_thread_id: messageThreadId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();

    // If thread not found, try without thread
    if (!result.ok && result.description?.includes("thread")) {
      console.warn("⚠️ Thread ID not found, retrying without thread...");
      const retryResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: "HTML",
          }),
        }
      );

      const retryResult = await retryResponse.json();
      if (retryResult.ok) {
        console.log("✅ Changelog sent to Telegram successfully! (without thread)");
      } else {
        console.error("❌ Failed to send:", retryResult);
        process.exit(1);
      }
    } else if (result.ok) {
      console.log("✅ Changelog sent to Telegram successfully!");
    } else {
      console.error("❌ Failed to send:", result);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error sending to Telegram:", error.message);
    process.exit(1);
  }
}

sendChangelog();
