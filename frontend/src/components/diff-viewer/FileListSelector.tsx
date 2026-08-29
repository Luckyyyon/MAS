import React from 'react';
import { FileCode, ShieldAlert, Zap, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';
import { RemediationDiff } from '../../types';
import { Badge } from '../ui/badge';

interface FileListSelectorProps {
  diffs: RemediationDiff[];
  selectedDiffId: string | null;
  onSelectDiff: (id: string) => void;
}

export const FileListSelector: React.FC<FileListSelectorProps> = ({
  diffs,
  selectedDiffId,
  onSelectDiff,
}) => {
  return (
    <div className="w-72 border-r border-border bg-[#0a0a0c] flex flex-col h-full flex-shrink-0 select-none">
      <div className="p-2.5 border-b border-border bg-[#0c0c0e] flex items-center justify-between">
        <div className="flex items-center space-x-1.5 font-mono text-xs font-medium text-zinc-300">
          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
          <span>REMEDIATED FILES</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{diffs.length} PATCHES</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/80 p-1 space-y-1">
        {diffs.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-zinc-600 font-mono text-xs space-y-2">
            <Inbox className="w-8 h-8 stroke-1 text-zinc-700" />
            <span>No active patches.</span>
            <span className="text-[10px] text-zinc-600">Run a scan or upload a script to view live diffs.</span>
          </div>
        ) : (
          diffs.map((diff) => {
            const isSelected = diff.id === selectedDiffId;
            const fileName = diff.file_path.split('/').pop();
            const fileDir = diff.file_path.split('/').slice(0, -1).join('/');

            return (
              <div
                key={diff.id}
                onClick={() => onSelectDiff(diff.id)}
                className={`p-2.5 rounded-sm cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                    : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800 text-zinc-400'
                }`}
              >
                {/* File Path & Language */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="truncate">
                    <div className="font-mono text-xs font-semibold text-zinc-200 truncate">{fileName}</div>
                    <div className="font-mono text-[10px] text-zinc-500 truncate">{fileDir}</div>
                  </div>
                  <Badge variant={diff.severity === 'critical' ? 'destructive' : 'warning'} className="text-[9px] py-0">
                    {diff.severity.toUpperCase()}
                  </Badge>
                </div>

                {/* Category & Diff Stats */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  <span className="text-zinc-400 truncate max-w-[120px]">{diff.category}</span>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-emerald-400 font-semibold">+{diff.lines_added}</span>
                    <span className="text-red-400 font-semibold">-{diff.lines_removed}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
