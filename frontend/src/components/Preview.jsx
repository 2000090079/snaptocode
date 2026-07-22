import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

function extractLucideIconNames(code) {
  const match = code.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"];?/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

function stripImports(code) {
  return code.replace(/^\s*import[^\n]+\n/gm, '');
}

function toGlobalComponent(code) {
  return code.replace(/export\s+default\s+/, 'window.GeneratedComponent = ');
}

function buildIconStubs(iconNames) {
  return iconNames
    .map(
      (name) => `function ${name}(props) {
  return React.createElement('svg', Object.assign({
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'
  }, props), React.createElement('circle', { cx: 12, cy: 12, r: 9 }));
}`
    )
    .join('\n');
}

function buildSrcDoc(code) {
  const iconNames = extractLucideIconNames(code);
  const iconStubs = buildIconStubs(iconNames);
  const cleanedCode = toGlobalComponent(stripImports(code));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${iconStubs}

    ${cleanedCode}

    try {
      ReactDOM.createRoot(document.getElementById('root')).render(
        React.createElement(window.GeneratedComponent)
      );
    } catch (err) {
      document.getElementById('root').innerHTML =
        '<pre style="color:#dc2626;padding:16px;white-space:pre-wrap;font-family:monospace;">' +
        'Preview failed to render:\\n' + err.message +
        '</pre>';
    }
  </script>
</body>
</html>`;
}

export default function Preview({ code }) {
  const srcDoc = useMemo(() => buildSrcDoc(code), [code]);

  function handleOpenInNewTab() {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-700 bg-[#27272a] px-4 py-2">
        <p className="text-xs text-zinc-400">
          Preview uses CDN, download for full features
        </p>
        <button
          onClick={handleOpenInNewTab}
          className="flex items-center gap-1.5 rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-600 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </button>
      </div>
      <iframe
        title="Generated design preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full flex-1 bg-white"
      />
    </div>
  );
}
