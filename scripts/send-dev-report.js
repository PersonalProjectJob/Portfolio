/**
 * Dev Working Report - Send to Telegram (Thread 727)
 * 
 * Automatically includes modified files from git status
 * 
 * Usage:
 * node scripts/send-dev-report.js "Brief title" "Summary of changes"
 * 
 * Or with explicit category:
 * node scripts/send-dev-report.js --title "Fix bug" --changes "Fixed X, Y"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load .env file manually
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .forEach(line => {
      const [key, ...valueParts] = line.split('=');
      process.env[key.trim()] = valueParts.join('=').trim();
    });
}

/**
 * Get modified files from git
 */
function getModifiedFiles() {
  try {
    // Get staged + unstaged changes (not committed yet)
    const status = execSync('git status --porcelain 2>nul', { 
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (!status.trim()) {
      return null;
    }
    
    const files = status.split('\n').filter(line => line.trim());
    
    const changes = {
      modified: [],
      added: [],
      deleted: [],
      renamed: [],
    };
    
    files.forEach(line => {
      const status = line.substring(0, 2).trim();
      const file = line.substring(3).trim();
      
      if (status.includes('M')) changes.modified.push(file);
      else if (status.includes('A') || status.includes('??')) changes.added.push(file);
      else if (status.includes('D')) changes.deleted.push(file);
      else if (status.includes('R')) changes.renamed.push(file);
    });
    
    return changes;
  } catch (e) {
    return null; // Git not available or not a git repo
  }
}

/**
 * Get todo list from TODO.md
 */
function getTodoProgress() {
  try {
    const todoPath = path.join(projectRoot, 'TODO.md');
    if (!fs.existsSync(todoPath)) return null;
    
    const content = fs.readFileSync(todoPath, 'utf-8');
    
    // Parse todo items (lines starting with - [ ] or - [x] or - [X])
    const lines = content.split('\n');
    const todos = {
      pending: [],
      completed: [],
      lastUpdated: null,
    };
    
    lines.forEach(line => {
      // Check for last updated
      const updatedMatch = line.match(/\*Last updated:\s*(.+)/i);
      if (updatedMatch) {
        todos.lastUpdated = updatedMatch[1].trim();
      }
      
      // Check for todo items
      const todoMatch = line.match(/^- \[([ xX])\]\s+(.+)/);
      if (todoMatch) {
        const status = todoMatch[1];
        const text = todoMatch[2].trim();
        if (status === 'x' || status === 'X') {
          todos.completed.push(text);
        } else {
          todos.pending.push(text);
        }
      }
    });
    
    const total = todos.pending.length + todos.completed.length;
    return total > 0 ? todos : null;
  } catch (e) {
    return null;
  }
}

/**
 * Format todo progress as HTML
 */
function formatTodoProgress(todos) {
  if (!todos) return '';
  
  const total = todos.pending.length + todos.completed.length;
  const done = todos.completed.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  
  let html = `\n📋 <b>Progress:</b> ${done}/${total} (${percent}%)`;
  
  if (todos.lastUpdated && todos.lastUpdated !== 'none') {
    html += `\n   <i>Updated: ${escapeHtml(todos.lastUpdated)}</i>`;
  }
  
  if (todos.completed.length > 0) {
    html += `\n\n<b>✅ Completed:</b>`;
    todos.completed.forEach(t => {
      html += `\n  ✓ ${escapeHtml(t)}`;
    });
  }
  
  if (todos.pending.length > 0) {
    html += `\n\n<b>⏳ Pending:</b>`;
    todos.pending.slice(0, 8).forEach(t => {
      html += `\n  • ${escapeHtml(t)}`;
    });
    if (todos.pending.length > 8) {
      html += `\n  <i>...and ${todos.pending.length - 8} more</i>`;
    }
  }
  
  return html;
}

/**
 * Get recent git diff stats
 */
function getDiffStats() {
  try {
    const diff = execSync('git diff --stat 2>nul', { 
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (!diff.trim()) return null;
    
    return diff.trim();
  } catch (e) {
    return null;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatFileChanges(changes) {
  if (!changes) return '';
  
  let html = '';
  
  if (changes.modified.length > 0) {
    html += '\n📝 <b>Modified:</b>\n';
    changes.modified.forEach(f => {
      html += `  • <code>${escapeHtml(f)}</code>\n`;
    });
  }
  
  if (changes.added.length > 0) {
    html += '\n🆕 <b>Added:</b>\n';
    changes.added.forEach(f => {
      html += `  • <code>${escapeHtml(f)}</code>\n`;
    });
  }
  
  if (changes.deleted.length > 0) {
    html += '\n🗑️ <b>Deleted:</b>\n';
    changes.deleted.forEach(f => {
      html += `  • <code>${escapeHtml(f)}</code>\n`;
    });
  }
  
  return html;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { title: null, changes: null };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      parsed.title = args[++i];
    } else if (args[i] === '--changes' && args[i + 1]) {
      parsed.changes = args[++i].replace(/\\n/g, '\n');
    } else if (!parsed.title) {
      parsed.title = args[i];
    } else if (!parsed.changes) {
      parsed.changes = args[i];
    }
  }
  
  return parsed;
}

async function sendDevReport() {
  const args = parseArgs();
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const telegramThreadId = process.env.TELEGRAM_DEV_THREAD_ID;
  
  if (!telegramBotToken || !telegramChatId) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    process.exit(1);
  }
  
  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  
  // Get file changes
  const fileChanges = getModifiedFiles();
  const diffStats = getDiffStats();
  const todoProgress = getTodoProgress();
  
  // Build message
  let message = `<b>🛠️ Dev Working Report</b>
📅 <b>Date:</b> ${now}`;
  
  if (args.title) {
    message += `\n📌 <b>Title:</b> ${escapeHtml(args.title)}`;
  }
  
  // Add todo progress section
  if (todoProgress) {
    message += formatTodoProgress(todoProgress);
  }
  
  if (args.changes) {
    message += `\n\n<b>✅ Changes:</b>\n${escapeHtml(args.changes)}`;
  }
  
  // Add file changes section
  if (fileChanges) {
    const fileHtml = formatFileChanges(fileChanges);
    if (fileHtml) {
      message += `\n\n<b>📂 Files Changed:</b>${fileHtml}`;
    }
    
    if (diffStats) {
      message += `\n<b>📊 Diff Stats:</b>\n<code>${escapeHtml(diffStats)}</code>`;
    }
  } else {
    message += '\n\n<i>(No git changes detected)</i>';
  }
  
  // Try with thread ID first, fall back to without
  let messageThreadId = telegramThreadId ? parseInt(telegramThreadId) : undefined;
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          message_thread_id: messageThreadId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );
    
    const result = await response.json();
    
    // If thread not found, try without thread
    if (!result.ok && result.description?.includes('thread')) {
      console.warn('⚠️ Thread ID not found, retrying without thread...');
      const retryResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );
      
      const retryResult = await retryResponse.json();
      if (retryResult.ok) {
        console.log('✅ Dev report sent to Telegram successfully! (without thread)');
      } else {
        console.error('❌ Failed to send:', retryResult);
      }
    } else if (result.ok) {
      console.log('✅ Dev report sent to Telegram successfully!');
    } else {
      console.error('❌ Failed to send:', result);
    }
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error.message);
  }
}

sendDevReport();
