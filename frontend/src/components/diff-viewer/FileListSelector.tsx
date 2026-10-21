import React from 'react';
import { RemediationDiff } from '../../types';

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
    <div className="w-72 border-r border-border bg-surface flex flex-col h-full flex-shrink-0 select-none font-sans">
      <div className="p-3 border-b border-border bg-surface-subtle flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase text-ink-primary">
          Remediated Files
        </span>
        <span className="text-[11px] font-mono text-ink-tertiary">{diffs.length} patches</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
        {diffs.length === 0 ? (
          <div className="p-6 text-center text-ink-tertiary text-xs space-y-1">
            <p className="font-medium text-ink-secondary">No active patches</p>
            <p className="text-[11px]">Run a scan to generate verified diffs.</p>
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
                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-surface-elevated border-border-strong text-ink-primary shadow-subtle'
                    : 'bg-transparent border-transparent hover:bg-surface-elevated/60 text-ink-secondary'
                }`}
              >
                {/* File Path & Severity Badge */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="truncate">
                    <div className="font-mono text-xs font-semibold text-ink-primary truncate">{fileName}</div>
                    <div className="font-mono text-[10px] text-ink-tertiary truncate">{fileDir}</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                      diff.severity === 'critical'
                        ? 'bg-[#fdf2f2] text-status-error border-[#f5c2c2]'
                        : 'bg-[#fff8e1] text-status-warning border-[#ffe082]'
                    }`}
                  >
                    {diff.severity}
                  </span>
                </div>

                {/* Category & +/- Line Counters */}
                <div className="flex items-center justify-between pt-1.5 text-xs font-mono">
                  <span className="text-ink-secondary truncate max-w-[120px]">{diff.category}</span>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="text-status-success font-medium">+{diff.lines_added}</span>
                    <span className="text-status-error font-medium">-{diff.lines_removed}</span>
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
