import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { RemediationDiff } from '../../types';

interface DiffCodeViewerProps {
  diff: RemediationDiff | null;
}

export const DiffCodeViewer: React.FC<DiffCodeViewerProps> = ({ diff }) => {
  const [isSideBySide, setIsSideBySide] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!diff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas text-ink-secondary font-sans select-none p-8 space-y-4">
        <div className="w-12 h-12 rounded-xl border border-border bg-surface-elevated flex items-center justify-center text-ink-tertiary shadow-subtle font-mono text-sm font-semibold">
          MAS
        </div>
        <div className="text-center space-y-1.5 max-w-md">
          <div className="text-sm font-semibold text-ink-primary">
            No Active Patch Selected
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Trigger a remediation scan from the navigation bar or select an item from the file list to review real-time AST patch diffs.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md w-full pt-2">
          <div className="p-3 rounded-lg border border-border bg-surface-elevated text-xs space-y-1 shadow-subtle">
            <div className="text-status-error font-medium">Security</div>
            <div className="text-[11px] text-ink-tertiary">SQLi, Deserialization, Subprocess</div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface-elevated text-xs space-y-1 shadow-subtle">
            <div className="text-accent font-medium">Performance</div>
            <div className="text-[11px] text-ink-tertiary">O(N²) loops, batching, stream I/O</div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface-elevated text-xs space-y-1 shadow-subtle">
            <div className="text-status-success font-medium">Refactoring</div>
            <div className="text-[11px] text-ink-tertiary">Complexity, typing, boundaries</div>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyPatched = () => {
    navigator.clipboard.writeText(diff.patched_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-elevated overflow-hidden font-sans">
      {/* Diff Header Bar */}
      <div className="h-10 px-4 border-b border-border bg-surface flex items-center justify-between select-none">
        <div className="flex items-center space-x-2.5">
          <span className="font-mono text-xs font-semibold text-ink-primary">
            {diff.file_path}
          </span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-ink-secondary">
            {diff.language}
          </span>
        </div>

        {/* View mode toggle & Copy action */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-surface-elevated border border-border rounded-lg p-0.5 text-xs font-mono shadow-subtle">
            <button
              onClick={() => setIsSideBySide(true)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                isSideBySide ? 'bg-surface text-ink-primary font-medium shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setIsSideBySide(false)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                !isSideBySide ? 'bg-surface text-ink-primary font-medium shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Unified Inline
            </button>
          </div>

          <button
            onClick={handleCopyPatched}
            className="text-xs font-medium h-7 px-3 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-ink-secondary hover:text-ink-primary transition-colors shadow-subtle"
          >
            {copied ? 'Copied to Clipboard' : 'Copy Remediation'}
          </button>
        </div>
      </div>

      {/* Code Header Columns (Original vs Remediated) */}
      <div className="grid grid-cols-2 border-b border-border bg-surface text-xs font-mono px-4 py-1.5 text-ink-secondary">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-status-error inline-block" />
          <span>Original Code (Vulnerable)</span>
        </div>
        <div className="flex items-center space-x-2 pl-3 border-l border-border">
          <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
          <span className="text-ink-primary font-medium">Agent Remediated Code (Synthesized AST)</span>
        </div>
      </div>

      {/* Monaco Diff Editor Light Theme Instance */}
      <div className="flex-1 relative">
        <DiffEditor
          height="100%"
          language={diff.language === 'go' ? 'go' : diff.language === 'typescript' ? 'typescript' : 'python'}
          original={diff.original_code}
          modified={diff.patched_code}
          theme="vs"
          options={{
            readOnly: true,
            renderSideBySide: isSideBySide,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            glyphMargin: false,
            folding: true,
            renderWhitespace: 'selection',
            diffWordWrap: 'off',
            padding: { top: 8, bottom: 8 },
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
};
