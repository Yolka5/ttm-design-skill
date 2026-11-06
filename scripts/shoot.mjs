#!/usr/bin/env node
/* Screenshot a page and catch what a code scan cannot see.

     node shoot.mjs page.html [--out shots] [--widths 1366,390] [--themes light,dark] [--wait 1500] [--scroll 0.75]

   For each width and theme it saves a full-page PNG and reports script errors,
   failed loads, sideways scrolling and text smaller than 12px. Exits 1 on any problem.
   --scroll also saves one screen-sized shot every 0.75 screens of scrolling. Use it on
   Show pages: a full-page shot cannot show pinned sections, sheets or the nav's states.
   Needs Node 22 or newer and Chrome. Set CHROME to its path if it is somewhere unusual. */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
if (!args.length || args[0].startsWith('--')) { console.log('usage: node shoot.mjs page.html [--out dir] [--widths 1366,390] [--themes light,dark] [--wait ms] [--scroll 0.75]'); process.exit(2); }
const opt = (name, def) => { const i = args.indexOf('--' + name); return i > -1 ? args[i + 1] : def; };
const target = /^https?:/.test(args[0]) ? args[0] : pathToFileURL(resolve(args[0])).href;
const out = resolve(opt('out', 'shots'));
const widths = opt('widths', '1366,390').split(',').map(Number);
const themes = opt('themes', 'light,dark').split(',');
const settle = Number(opt('wait', 1500));
const scrollStep = args.includes('--scroll') ? Number(opt('scroll', 0.75)) || 0.75 : 0;

const chromePath = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((p) => existsSync(p));
if (!chromePath) { console.log('Chrome not found. Set CHROME to its path.'); process.exit(2); }

mkdirSync(out, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'shoot-'));
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 80 && !page; i++) {
  await wait(250);
  try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
}
if (!page) { console.log('Could not start Chrome.'); chrome.kill(); process.exit(2); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0, label = '';
const pending = new Map(), problems = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') problems.push(`${label}: script error: ${m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text}`);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') problems.push(`${label}: console error: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) problems.push(`${label}: failed to load: ${m.params.errorText}`);
};
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
for (const theme of themes) {
  for (const width of widths) {
    label = `${width}px ${theme}`;
    await send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 600 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
    await send('Page.navigate', { url: target });
    await wait(settle);
    const over = await ev('document.documentElement.scrollWidth - innerWidth');
    if (over > 0) problems.push(`${label}: page scrolls sideways by ${over}px`);
    const small = await ev(`[...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 12).length`);
    if (small) problems.push(`${label}: ${small} element(s) with text under 12px`);
    const m = await send('Page.getLayoutMetrics');
    const h = Math.min(Math.ceil(m.cssContentSize.height), 8000);
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: h, scale: 1 } });
    const file = join(out, `${width}-${theme}.png`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    console.log('saved', file);
    if (scrollStep) {
      /* The full-page capture stretches the viewport and leaves scroll observers
         stale, so reset the size and load the page again first. */
      await send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 600 });
      await send('Page.navigate', { url: target });
      await wait(settle);
      const vh = await ev('innerHeight');
      const total = await ev('document.documentElement.scrollHeight - innerHeight');
      let n = 0;
      for (let y = 0; y <= total && n < 60; y += Math.round(vh * scrollStep), n++) {
        await ev(`window.scrollTo(0, ${y})`);
        await wait(450);
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const f = join(out, `${width}-${theme}-scroll-${String(n).padStart(2, '0')}.png`);
        writeFileSync(f, Buffer.from(shot.data, 'base64'));
      }
      console.log(`saved ${n} scroll shots for ${label}`);
      await ev('window.scrollTo(0, 0)');
    }
  }
}
ws.close(); chrome.kill(); await wait(300);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(problems.length ? `${problems.length} problem(s)\n  - ` + [...new Set(problems)].join('\n  - ') : 'no problems found');
process.exit(problems.length ? 1 : 0);
