import { chromium } from 'playwright-core';
import type { Tool, ToolResult } from '../types.js';

// ---------------------------------------------------------------------------
// browser_fetch — Headless Chromium for JS-heavy sites
// ---------------------------------------------------------------------------
// Uses system Chromium on Pi. Short-lived sessions to conserve RAM.
// Fallback when web_fetch gets 403/blocked. NOT for bypassing protections.
// ---------------------------------------------------------------------------

const CHROMIUM_PATH = process.platform === 'linux' ? '/usr/bin/chromium' : undefined;

export const browserFetchTool: Tool = {
  name: 'browser_fetch',
  description: 'Fetch a web page using a real browser (Chromium). Use when web_fetch gets 403/blocked or for JS-heavy sites. Returns rendered page text. Slower and heavier than web_fetch — use as fallback only.',
  inputSchema: {
    parameters: {
      url: { type: 'string', description: 'The URL to visit', required: true },
      selector: { type: 'string', description: 'Optional CSS selector to extract specific content', required: false },
      waitFor: { type: 'string', description: 'CSS selector to wait for before extracting (for dynamic content)', required: false },
      screenshot: { type: 'boolean', description: 'Take a screenshot (returns base64)', required: false },
    },
  },
  riskLevel: 'low',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const url = params.url as string;
    const selector = params.selector as string | undefined;
    const waitForSelector = params.waitFor as string | undefined;
    const takeScreenshot = params.screenshot as boolean | undefined;

    let browser;
    try {
      browser = await chromium.launch({
        executablePath: CHROMIUM_PATH,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',  // Pi has limited /dev/shm
          '--disable-extensions',
          '--disable-background-networking',
          '--single-process',         // Lower memory on Pi
        ],
      });

      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10_000 }).catch(() => {});
      }

      let content: string;
      if (selector) {
        const el = await page.$(selector);
        content = el ? (await el.textContent() ?? '') : `Selector "${selector}" not found on page`;
      } else {
        // Extract meaningful text, not raw HTML
        content = await page.evaluate(() => {
          // Remove scripts, styles, nav, footer
          document.querySelectorAll('script, style, nav, footer, header, [role="banner"], [role="navigation"]').forEach(el => el.remove());
          return document.body?.innerText?.trim() ?? '';
        });
      }

      // Truncate to 10KB
      const truncated = content.length > 10_000 ? content.slice(0, 10_000) + '\n... (truncated)' : content;

      const output: Record<string, unknown> = {
        url,
        title: await page.title(),
        content: truncated,
        contentLength: content.length,
      };

      if (takeScreenshot) {
        const buf = await page.screenshot({ type: 'jpeg', quality: 50, fullPage: false });
        output.screenshot = buf.toString('base64').slice(0, 5000); // Cap screenshot size
      }

      await browser.close();
      return { success: true, output, durationMs: Date.now() - start };
    } catch (error) {
      await browser?.close().catch(() => {});
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - start,
      };
    }
  },
};
