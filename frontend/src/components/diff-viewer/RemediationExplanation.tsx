import React from 'react';
import { RemediationDiff } from '../../types';

interface RemediationExplanationProps {
  diff: RemediationDiff;
  onAcceptPatch: (id: string) => void;
  onRejectPatch: (id: string) => void;
  onRerunAgent: (id: string) => void;
}

export const RemediationExplanation: React.FC<RemediationExplanationProps> = ({
  diff,
  onAcceptPatch,
  onRejectPatch,
  onRerunAgent,
}) => {
  return (
    <div className="border-t border-border bg-surface px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none font-sans">
      {/* Left: Summary & Rationale */}
      <div className="space-y-1 max-w-3xl">
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated border border-border text-ink-primary font-medium">
            {diff.agent}
          </span>
          <span className="font-mono text-xs font-semibold text-ink-primary">
            {diff.description}
          </span>
          <span className="text-[11px] font-mono text-status-success bg-[#f0f9f1] border border-[#c8e6c9] px-2 py-0.5 rounded-md">
            {(diff.confidence * 100).toFixed(0)}% Confidence
          </span>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          <strong className="text-ink-primary font-mono text-[11px]">Rationale: </strong>
          {diff.remediation_rationale}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => onRerunAgent(diff.id)}
          className="h-8 px-3 text-xs font-medium rounded-lg bg-surface-elevated hover:bg-surface border border-border text-ink-secondary hover:text-ink-primary transition-colors shadow-subtle"
        >
          Re-Synthesize
        </button>

        <button
          onClick={() => onRejectPatch(diff.id)}
          className="h-8 px-3 text-xs font-medium rounded-lg bg-[#fdf2f2] hover:bg-[#fae8e8] border border-[#f5c2c2] text-status-error transition-colors"
        >
          Reject
        </button>

        <button
          onClick={() => onAcceptPatch(diff.id)}
          className="h-8 px-4 text-xs font-medium rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors shadow-subtle"
        >
          Accept Patch
        </button>
      </div>
    </div>
  );
};
