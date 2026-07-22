import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeOutput({ code }) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700 bg-[#27272a]">
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
        <span className="rounded-md bg-teal-500/20 px-2 py-1 text-xs font-medium text-teal-300">
          React + Tailwind
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto flex-1">
        <pre className="flex text-sm leading-6">
          <code className="select-none border-r border-zinc-700 px-3 py-4 text-right text-zinc-600">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </code>
          <code className="flex-1 whitespace-pre px-4 py-4 text-zinc-200">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
