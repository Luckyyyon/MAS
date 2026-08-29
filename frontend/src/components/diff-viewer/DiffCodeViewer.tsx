import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { 
  Columns, 
  Rows, 
  Copy, 
  Check, 
  FileCode, 
  Maximize2, 
  Code, 
  Sparkles,
  Sliders,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { RemediationDiff } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DiffCodeViewerProps {
  diff: RemediationDiff | null;
}

export const DiffCodeViewer: React.FC<DiffCodeViewerProps> = ({ diff }) => {
  const [isSideBySide, setIsSideBySide] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!diff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-zinc-400 font-mono select-none p-6 space-y-4">
        <div className="w-12 h-12 rounded-sm border border-zinc-800 bg-[#0d0d10] flex items-center justify-center text-zinc-500">
          <Code className="w-6 h-6 text-zinc-400 stroke-1" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            Awaiting Real Code Target
          </div>
          <p className="text-xs text-zinc-500 max-w-md font-sans">
            Trigger a real remediation scan from the header or select an active file to inspect live AST patch diffs.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md w-full pt-2">
          <div className="p-2.5 rounded-sm border border-zinc-850 bg-zinc-950/60 text-[11px] space-y-1">
            <div className="text-rose-400 font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security</span>
            </div>
            <div className="text-[10px] text-zinc-500">SQLi, Deserialization, Command Inj</div>
          </div>

          <div className="p-2.5 rounded-sm border border-zinc-850 bg-zinc-950/60 text-[11px] space-y-1">
            <div className="text-blue-400 font-semibold flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Performance</span>
            </div>
            <div className="text-[10px] text-zinc-500">O(N²) loops, I/O batching, memory leaks</div>
          </div>

          <div className="p-2.5 rounded-sm border border-zinc-850 bg-zinc-950/60 text-[11px] space-y-1">
            <div className="text-emerald-400 font-semibold flex items-center space-x-1">
              <FileCode className="w-3.5 h-3.5" />
              <span>Refactor</span>
            </div>
            <div className="text-[10px] text-zinc-500">Complexity, typing, clean architecture</div>
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
    <div className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden">
      {/* Diff Header Controls */}
      <div className="h-9 px-3 border-b border-border bg-[#0c0c0e] flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-xs font-semibold text-zinc-200">
            {diff.file_path}
          </span>
          <Badge variant="outline" className="text-[10px] uppercase py-0 text-zinc-400">
            {diff.language}
          </Badge>
        </div>

        {/* View mode toggle & actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm p-0.5">
            <button
              onClick={() => setIsSideBySide(true)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-sm transition-colors ${
                isSideBySide ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Side-by-side diff"
            >
              <Columns className="w-3 h-3 inline mr-1" />
              SPLIT
            </button>
            <button
              onClick={() => setIsSideBySide(false)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-sm transition-colors ${
                !isSideBySide ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Unified inline diff"
            >
              <Rows className="w-3 h-3 inline mr-1" />
              UNIFIED
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyPatched}
            className="text-[11px] font-mono h-6 px-2 text-zinc-400 hover:text-zinc-200"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'COPIED' : 'COPY PATCH'}
          </Button>
        </div>
      </div>

      {/* Code Labels (Original vs Remediated) */}
      <div className="grid grid-cols-2 border-b border-zinc-900 bg-[#09090b] text-[11px] font-mono text-zinc-500 px-3 py-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
          <span>ORIGINAL CODE (VULNERABLE)</span>
        </div>
        <div className="flex items-center space-x-2 pl-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
          <span className="text-zinc-300">AGENT REMEDIATED CODE (SYNTHESIZED)</span>
        </div>
      </div>

      {/* Monaco Diff Editor Instance */}
      <div className="flex-1 relative">
        <DiffEditor
          height="100%"
          language={diff.language === 'go' ? 'go' : diff.language === 'typescript' ? 'typescript' : 'python'}
          original={diff.original_code}
          modified={diff.patched_code}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: isSideBySide,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
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
