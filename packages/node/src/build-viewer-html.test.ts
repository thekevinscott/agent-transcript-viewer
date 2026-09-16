import { describe, expect, it } from 'vitest';

import { buildViewerHtml } from './build-viewer-html';

describe('buildViewerHtml', () => {
  it('inlines the given entry JS with no external asset requests', () => {
    const html = buildViewerHtml("export const VIEWER_NAME = 'agent-transcript-viewer';");

    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain("const VIEWER_NAME = 'agent-transcript-viewer';");
    expect(html).not.toContain('export ');
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toMatch(/href="https?:/);
    expect(html).not.toMatch(/src="https?:/);
  });

  it('strips sourceMappingURL comments so devtools cannot request an external map', () => {
    const html = buildViewerHtml(
      "export const VIEWER_NAME = 'x';\n//# sourceMappingURL=index.js.map\n",
    );

    expect(html).not.toContain('sourceMappingURL');
  });

  it('mounts the entry export to the DOM so the page is real, not a placeholder', () => {
    const html = buildViewerHtml("export const VIEWER_NAME = 'agent-transcript-viewer';");

    expect(html).toMatch(/getElementById\('app'\)/);
    expect(html).toContain('VIEWER_NAME');
  });
});
