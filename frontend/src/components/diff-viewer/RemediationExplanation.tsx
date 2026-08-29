import React from 'react';
import { 
  ShieldAlert, 
  Check, 
  X, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  GitPullRequest,
  CheckCircle2,
  Info
} from 'lucide-react';
import { RemediationDiff } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
    <div className="border-t border-border bg-[#0b0b0e] p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none">
      {/* Left: Summary & Rationale */}
      <div className="space-y-1 max-w-3xl">
        <div className="flex items-center space-x-2">
          <Badge variant="agent" agentType={diff.agent} className="text-[10px]">
            {diff.agent}
          </Badge>
          <span className="font-mono text-xs font-semibold text-zinc-200">
            {diff.description}
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded-sm">
            {(diff.confidence * 100).toFixed(0)}% Confidence
          </span>
        </div>

        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          <strong className="text-zinc-300 font-mono text-[11px]">Rationale: </strong> 
          {diff.remediation_rationale}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRerunAgent(diff.id)}
          className="text-xs font-mono h-7"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RE-SYNTHESIZE</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRejectPatch(diff.id)}
          className="text-xs font-mono h-7"
        >
          <X className="w-3 h-3" />
          <span>REJECT</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onAcceptPatch(diff.id)}
          className="text-xs font-mono h-7"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ACCEPT PATCH</span>
        </Button>
      </div>
    </div>
  );
};
