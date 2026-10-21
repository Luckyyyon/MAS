import React from 'react';
import { AgentStatus, AgentType } from '../../types';

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
    <div className="border-b border-border bg-surface px-4 py-3 flex flex-col space-y-3 font-sans">
      {/* Top Topology Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider font-mono">
            Agent Orchestration Topology
          </span>
          <span className="text-border">|</span>
          <span className="text-xs text-ink-secondary">
            {isScanning ? "Active LangGraph Pipeline Execution" : "4 Specialized Agents Standby / AST Synchronized"}
          </span>
        </div>

        {/* Global KPIs */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-surface-elevated border border-border px-2.5 py-1 rounded-md shadow-subtle">
            <span className="text-ink-tertiary">AST VULNS:</span>
            <span className="text-status-error font-medium">{totalVulnerabilities}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-surface-elevated border border-border px-2.5 py-1 rounded-md shadow-subtle">
            <span className="text-ink-tertiary">SYNTHESIZED:</span>
            <span className="text-status-success font-medium">{totalPatches}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-surface-elevated border border-border px-2.5 py-1 rounded-md shadow-subtle">
            <span className="text-ink-tertiary">CONFIDENCE:</span>
            <span className="text-ink-primary font-medium">{(avgConfidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Agents Topology Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`p-3 rounded-lg border bg-surface-elevated transition-all flex flex-col justify-between ${
              isScanning && agent.state !== 'idle'
                ? 'border-accent/60 shadow-card ring-2 ring-accent/10'
                : 'border-border-subtle shadow-subtle'
            }`}
          >
            <div>
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${getAgentDotColor(agent.name)}`} />
                  <span className="font-mono text-xs font-semibold text-ink-primary truncate max-w-[130px]">
                    {agent.name}
                  </span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getStateStyle(agent.state)}`}>
                  {agent.state}
                </span>
              </div>

              {/* Subtask Description */}
              <p className="text-xs text-ink-secondary leading-snug line-clamp-2 min-h-[32px] mb-2">
                {agent.current_task}
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
                <span className="truncate max-w-[120px]">{agent.model}</span>
                <span className="text-ink-secondary font-medium">{agent.progress}%</span>
              </div>

              <div className="w-full bg-surface-subtle h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getAgentDotColor(name: AgentType): string {
  switch (name) {
    case 'Supervisor':
      return 'bg-ink-primary';
    case 'Security Agent':
      return 'bg-status-error';
    case 'Performance Agent':
      return 'bg-accent';
    case 'Syntax & Refactor Agent':
      return 'bg-status-success';
    default:
      return 'bg-ink-tertiary';
  }
}

function getStateStyle(state: string): string {
  switch (state) {
    case 'analyzing':
      return 'bg-[#fff8e1] text-status-warning border-[#ffe082]';
    case 'remediating':
      return 'bg-[#fdf2f2] text-status-error border-[#f5c2c2]';
    case 'validating':
      return 'bg-[#e8f2fc] text-accent border-[#b3d7f7]';
    case 'completed':
      return 'bg-[#f0f9f1] text-status-success border-[#c8e6c9]';
    default:
      return 'bg-surface text-ink-secondary border-border-subtle';
  }
}
