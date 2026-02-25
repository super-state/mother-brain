import type { Tool, ToolResult } from '../types.js';

// ---------------------------------------------------------------------------
// web_fetch — HTTP GET/POST with intelligent content extraction
// ---------------------------------------------------------------------------

// Rule: tools return data, not documents.
// RSS → items array. HTML → text snippets. JSON → pass through.

const MAX_ITEMS = 10;
const MAX_FIELD_LENGTH = 300;
const MAX_TOTAL_OUTPUT = 4000;

/** Extract structured items from RSS/Atom XML. */
function extractRSS(xml: string): Array<{ title: string; link: string; published?: string; excerpt?: string }> {
  const items: Array<{ title: string; link: string; published?: string; excerpt?: string }> = [];
  // Match <item> or <entry> blocks
  const itemPattern = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemPattern.exec(xml)) !== null && items.length < MAX_ITEMS) {
    const block = match[1];
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() ?? '';
    const link = block.match(/<link[^>]*href="([^"]*)"[^>]*>/i)?.[1]
      ?? block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? '';
    const published = block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i)?.[1]?.trim();
    const desc = block.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i)?.[1]
      ?.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
      ?.replace(/<[^>]+>/g, '')
      ?.trim();
    const excerpt = desc ? desc.slice(0, MAX_FIELD_LENGTH) : undefined;

    if (title) items.push({ title: title.slice(0, MAX_FIELD_LENGTH), link, published, excerpt });
  }
  return items;
}

/** Extract readable text from HTML, stripping tags. */
function extractHTML(html: string): { title: string; text: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  // Strip scripts, styles, tags
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TOTAL_OUTPUT);
  return { title, text };
}

/** Auto-detect content type and extract structured data. */
function extractContent(body: string, contentType: string | null): unknown {
  const ct = (contentType ?? '').toLowerCase();

  // RSS/Atom
  if (ct.includes('xml') || ct.includes('rss') || ct.includes('atom') || body.trimStart().startsWith('<?xml')) {
    const items = extractRSS(body);
    if (items.length > 0) return { type: 'rss', itemCount: items.length, items };
  }

  // JSON
  if (ct.includes('json')) {
    try {
      const parsed = JSON.parse(body);
      const json = JSON.stringify(parsed);
      return { type: 'json', data: json.length > MAX_TOTAL_OUTPUT ? json.slice(0, MAX_TOTAL_OUTPUT) : parsed };
    } catch { /* fall through */ }
  }

  // HTML → extract readable text
  if (ct.includes('html') || body.trimStart().startsWith('<!') || body.trimStart().startsWith('<html')) {
    return { type: 'html', ...extractHTML(body) };
  }

  // Plain text
  return { type: 'text', text: body.slice(0, MAX_TOTAL_OUTPUT) };
}

export const webFetchTool: Tool = {
  name: 'web_fetch',
  description: 'Fetch content from a URL. Automatically extracts structured data: RSS→items, HTML→text, JSON→data. Returns clean, reduced output.',
  inputSchema: {
    parameters: {
      url: { type: 'string', description: 'The URL to fetch', required: true },
      method: { type: 'string', description: 'HTTP method', enum: ['GET', 'POST'], required: false },
      headers: { type: 'object', description: 'Additional HTTP headers as key-value pairs', required: false },
      body: { type: 'string', description: 'Request body (for POST requests)', required: false },
    },
  },
  riskLevel: 'low',
  builtin: true,

  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const start = Date.now();
    const url = params.url as string;
    const method = (params.method as string) || 'GET';
    const headers = (params.headers as Record<string, string>) || {};
    const body = params.body as string | undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MotherBrain/0.1; +https://github.com/super-state/mother-brain)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...headers,
        },
        body: method === 'POST' ? body : undefined,
        signal: AbortSignal.timeout(30_000),
      });

      const text = await response.text();
      const durationMs = Date.now() - start;
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        return {
          success: false,
          output: { status: response.status, statusText: response.statusText, body: text.slice(0, 500) },
          error: `HTTP ${response.status}: ${response.statusText}`,
          durationMs,
        };
      }

      // Smart extraction: RSS→items, HTML→text, JSON→data
      const extracted = extractContent(text, contentType);

      return {
        success: true,
        output: { status: response.status, url, contentType, data: extracted },
        durationMs,
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - start,
      };
    }
  },
};
