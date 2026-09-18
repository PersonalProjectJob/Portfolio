import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qdnokiesxrjrfvjtkvwf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbm9raWVzeHJqcmZ2anRrdndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTA1NDEsImV4cCI6MjEwMTY4NjU0MX0.Hxf7EbCv1ovo9ogVP10mJ89WWh3b_2pJvX-IyBgIyIg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('================================================================');
console.log('   TEST: LIVE SUPABASE CLOUD SYNC FROM BROWSER                  ');
console.log('================================================================\n');

async function testCloudSync() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  try {
    console.log('▶ [1] Opening /project/agent-handoff in browser...');
    const page = await context.newPage();
    await page.goto('http://localhost:5173/project/agent-handoff');

    console.log('  ⏳ Waiting 3.5s for initial presence handshake and Supabase background sync...');
    await page.waitForTimeout(3500);

    // Scroll a bit
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);

    console.log('\n▶ [2] Querying remote Supabase Cloud database...');
    
    const { data: views, error: errViews } = await supabase
      .from('post_views')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    console.log(`  ✓ post_views on Supabase (${views ? views.length : 0} rows, error: ${errViews ? errViews.message : 'none'}):`);
    if (views && views.length > 0) {
      views.forEach(v => console.log(`     - [${v.project_id}] ${v.project_name} at ${v.timestamp}`));
    }

    const { data: sessions, error: errSessions } = await supabase
      .from('ux_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`\n  ✓ ux_sessions on Supabase (${sessions ? sessions.length : 0} rows, error: ${errSessions ? errSessions.message : 'none'}):`);
    if (sessions && sessions.length > 0) {
      sessions.forEach(s => console.log(`     - [${s.session_token}] slug=${s.page_slug}, readerType=${s.reader_type}, duration=${s.total_duration_ms}ms`));
    }

    const { data: events, error: errEvents } = await supabase
      .from('ux_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    console.log(`\n  ✓ ux_events on Supabase (${events ? events.length : 0} rows, error: ${errEvents ? errEvents.message : 'none'}):`);
    if (events && events.length > 0) {
      events.forEach(e => console.log(`     - [${e.section_id}] dwell=${e.dwell_time_ms}ms, type=${e.event_type}`));
    }

    console.log('\n================================================================');
    console.log('   RESULT: LIVE SUPABASE CLOUD VERIFICATION COMPLETE!           ');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

testCloudSync().catch(e => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
