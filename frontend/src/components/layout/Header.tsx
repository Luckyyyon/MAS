import React from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Cpu, 
  GitBranch, 
  Activity, 
  Play, 
  Terminal, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface HeaderProps {
  currentRepo: string;
  currentBranch: string;
  isScanning: boolean;
  onTriggerScan: () => void;
  wsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRepo,
  currentBranch,
  isScanning,
  onTriggerScan,
  wsConnected,
}) => {
  return (
    <header className="h-12 border-b border-border bg-[#09090b] px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Mode */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-zinc-100 text-zinc-950 flex items-center justify-center rounded-sm font-mono font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs tracking-tight text-zinc-100 uppercase font-mono">
            MAS // Remediation Engine
          </span>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800" />

        <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
          <span className="text-zinc-200 font-medium">Phase 1</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Autonomous AST Synthesizer</span>
        </div>
      </div>

      {/* Target Repo Quick Info */}
      <div className="hidden md:flex items-center space-x-2 text-xs font-mono bg-zinc-900/90 border border-zinc-800/80 px-2.5 py-1 rounded-sm">
        <span className="text-zinc-500">TARGET:</span>
        <span className="text-zinc-200 truncate max-w-[220px]">
          {currentRepo.replace('https://github.com/', '')}
        </span>
        <span className="text-zinc-600">:</span>
        <div className="flex items-center text-zinc-400 space-x-1">
          <GitBranch className="w-3 h-3 text-zinc-500" />
          <span>{currentBranch}</span>
        </div>
      </div>

      {/* Actions & Daemon Connection Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500 ring-2 ring-amber-500/20'}`} />
          <span className="text-zinc-400 hidden sm:inline">
            {wsConnected ? 'DAEMON ONLINE' : 'DAEMON STANDBY'}
          </span>
        </div>

        <Button
          variant={isScanning ? 'secondary' : 'primary'}
          size="sm"
          onClick={onTriggerScan}
          disabled={isScanning}
          className="h-7 text-xs font-mono"
        >
          {isScanning ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>ORCHESTRATING...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>RUN REMEDIATION</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
