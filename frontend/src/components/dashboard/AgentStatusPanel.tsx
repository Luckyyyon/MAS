import React from 'react';
import { 
  Bot, 
  ShieldAlert, 
  Zap, 
  Code2, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  Gauge, 
  Shield, 
  GitMerge, 
  ArrowUpRight 
} from 'lucide-react';
import { AgentStatus, AgentType } from '../../types';
import { Badge } from '../ui/badge';

interface AgentStatusPanelProps {
  agents: AgentStatus[];
  isScanning: boolean;
  totalVulnerabilities: number;
  totalPatches: number;
  avgConfidence: number;
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  agents,
  isScanning,
  totalVulnerabilities,
  totalPatches,
  avgConfidence,
}) => {
  return (
    <div className="border-b border-border bg-[#0a0a0c] p-3 flex flex-col space-y-3">
      {/* Top Bar: Title & High-level Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-mono text-xs font-semibold text-zinc-200">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>MULTI-AGENT ORCHESTRATION TOPOLOGY</span>
          </div>
          <span className="text-zinc-600 font-mono text-xs">|</span>
          <span className="text-[11px] font-mono text-zinc-400">
            {isScanning ? "Active Pipeline Execution" : "4 Agents Standby / AST Synchronized"}
          </span>
        </div>

        {/* Global KPI stats */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
            <span className="text-zinc-500">AST VULNS:</span>
            <span className="text-red-400 font-semibold">{totalVulnerabilities}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
            <span className="text-zinc-500">SYNTHESIZED PATCHES:</span>
            <span className="text-emerald-400 font-semibold">{totalPatches}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
            <span className="text-zinc-500">AVG CONFIDENCE:</span>
            <span className="text-zinc-200 font-semibold">{(avgConfidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Agents Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {agents.map((agent) => {
          const icon = getAgentIcon(agent.name);
          const stateColor = getStateBadgeVariant(agent.state);

          return (
            <div
              key={agent.name}
              className={`p-2.5 rounded-sm border bg-[#0d0d10] transition-all flex flex-col justify-between ${
                isScanning && agent.state !== 'idle'
                  ? 'border-zinc-700 bg-zinc-900/60 shadow-sm'
                  : 'border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              {/* Header: Name + State */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    {icon}
                    <span className="font-mono text-xs font-medium text-zinc-200 truncate max-w-[130px]">
                      {agent.name}
                    </span>
                  </div>
                  <Badge variant={stateColor} className="text-[9px] px-1 py-0 uppercase">
                    {agent.state}
                  </Badge>
                </div>

                {/* Subtask description */}
                <p className="text-[11px] text-zinc-400 leading-snug font-sans line-clamp-2 min-h-[32px] mb-2">
                  {agent.current_task}
                </p>
              </div>

              {/* Bottom: Progress Bar & Model */}
              <div className="space-y-1.5 pt-1.5 border-t border-zinc-850">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="truncate max-w-[110px]">{agent.model}</span>
                  <span className="text-zinc-400 font-medium">{agent.progress}%</span>
                </div>

                {/* Linear minimalist progress indicator */}
                <div className="w-full bg-zinc-800 h-1 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressColor(agent.name)}`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getAgentIcon(name: AgentType) {
  switch (name) {
    case 'Supervisor':
      return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
    case 'Security Agent':
      return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    case 'Performance Agent':
      return <Zap className="w-3.5 h-3.5 text-blue-400" />;
    case 'Syntax & Refactor Agent':
      return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
    default:
      return <Bot className="w-3.5 h-3.5 text-zinc-400" />;
  }
}

function getStateBadgeVariant(state: string): any {
  switch (state) {
    case 'analyzing':
      return 'warning';
    case 'remediating':
      return 'destructive';
    case 'validating':
      return 'agent';
    case 'completed':
      return 'success';
    default:
      return 'secondary';
  }
}

function getProgressColor(name: AgentType): string {
  switch (name) {
    case 'Supervisor':
      return 'bg-purple-500';
    case 'Security Agent':
      return 'bg-rose-500';
    case 'Performance Agent':
      return 'bg-blue-500';
    case 'Syntax & Refactor Agent':
      return 'bg-emerald-500';
    default:
      return 'bg-zinc-400';
  }
}
