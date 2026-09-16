export function buildViewerHtml(entryJs: string): string {
  const inlineJs = entryJs
    .replace(/^export\s+/gm, '')
    .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
    .trim();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Agent Transcript Viewer</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
${inlineJs}
      document.getElementById('app').textContent = VIEWER_NAME;
    </script>
  </body>
</html>
`;
}
