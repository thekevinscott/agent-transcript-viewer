import { describe, expect, it } from 'vitest';

import { buildViewerHtml } from './build-viewer-html';

describe('buildViewerHtml', () => {
  it('inlines the given entry JS with no external asset requests', () => {
    const html = buildViewerHtml("export const VIEWER_NAME = 'agent-transcript-viewer';");

    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain(
      "<script>\nconst VIEWER_NAME = 'agent-transcript-viewer';\n      document.getElementById",
    );
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).not.toMatch(/href="https?:/);
    expect(html).not.toMatch(/src="https?:/);
  });

  it('drops a sourceMappingURL comment so devtools cannot request an external map', () => {
    const html = buildViewerHtml('export const A = 1;\n//# sourceMappingURL=index.js.map');

    expect(html).toContain('<script>\nconst A = 1;\n      document.getElementById');
  });

  it('strips the export keyword only where it opens a line', () => {
    const html = buildViewerHtml("const note = 'export me';\nexport const A = 1;");

    expect(html).toContain(
      "<script>\nconst note = 'export me';\nconst A = 1;\n      document.getElementById",
    );
  });

  it('mounts the entry export to the DOM so the page is real, not a placeholder', () => {
    const html = buildViewerHtml("export const VIEWER_NAME = 'agent-transcript-viewer';");

    expect(html).toMatch(/getElementById\('app'\)/);
    expect(html).toContain('VIEWER_NAME');
  });
});
