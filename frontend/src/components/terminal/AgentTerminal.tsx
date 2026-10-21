import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog } from '../../types';

interface AgentTerminalProps {
  logs: TerminalLog[];
  onClear: () => void;
  onSendCommand: (cmd: string) => void;
  isStreaming: boolean;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({
  logs,
  onClear,
  onSendCommand,
  isStreaming,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [inputCmd, setInputCmd] = useState<string>('');
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    if (filterAgent === 'ALL') return true;
    return log.agent === filterAgent;
  });

  // Zero-lag instant scroll for high-frequency telemetry logs
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    onSendCommand(inputCmd);
    setInputCmd('');
  };

  const exportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.agent}] [${l.level}]: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mas-telemetry-${Date.now()}.log`;
    a.click();
  };

  return (
    <div className="border-t border-border bg-surface flex flex-col transition-all duration-150 select-none font-sans">
      {/* Terminal Control Bar */}
      <div className="h-9 px-4 border-b border-border bg-surface-subtle flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs font-semibold text-ink-primary">
            Agent Telemetry Console
          </span>

          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className={`inline-block w-2 h-2 rounded-full ${isStreaming ? 'bg-status-success animate-pulse' : 'bg-ink-tertiary'}`} />
            <span className="text-ink-secondary">{isStreaming ? 'Streaming' : 'Idle'}</span>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Filter */}
          <div className="flex items-center bg-surface-elevated border border-border rounded-md px-2 py-0.5 shadow-subtle">
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-transparent text-ink-primary text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Agents</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Security Agent">Security Agent</option>
              <option value="Performance Agent">Performance Agent</option>
              <option value="Syntax & Refactor Agent">Syntax Agent</option>
            </select>
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded-md border text-xs transition-colors ${
              autoScroll ? 'bg-surface-elevated border-border-strong text-ink-primary font-medium' : 'bg-surface border-border text-ink-tertiary'
            }`}
          >
            {autoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
          </button>

          {/* Export */}
          <button
            onClick={exportLogs}
            className="px-2 py-0.5 rounded-md border border-border bg-surface-elevated hover:bg-surface text-ink-secondary hover:text-ink-primary transition-colors text-xs"
          >
            Export Log
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="px-2 py-0.5 rounded-md border border-border bg-surface-elevated hover:bg-surface text-ink-secondary hover:text-ink-primary transition-colors text-xs"
          >
            Clear
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2 py-0.5 rounded-md border border-border bg-surface-elevated hover:bg-surface text-ink-secondary hover:text-ink-primary text-xs"
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      {!isCollapsed && (
        <div className="flex flex-col h-44">
          <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-surface-elevated">
            {filteredLogs.length === 0 ? (
              <div className="text-ink-tertiary text-xs italic">No telemetry messages received.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed hover:bg-surface px-1.5 py-0.5 rounded">
                  <span className="text-ink-tertiary select-none flex-shrink-0 text-[11px]">{log.timestamp}</span>
                  <span className={`text-[10px] px-1.5 py-0 rounded border flex-shrink-0 font-medium ${getAgentBadgeStyle(log.agent)}`}>
                    {log.agent}
                  </span>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${getLevelStyle(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className="text-ink-primary break-all select-text font-mono text-xs">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Command Prompt */}
          <form onSubmit={handleCommandSubmit} className="h-8 border-t border-border bg-surface px-3 flex items-center space-x-2">
            <span className="text-ink-tertiary font-mono text-xs select-none">agent@mas:~$</span>
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="Inject supervisor prompt (e.g. 're-verify AST boundary' or 'rerun security')..."
              className="flex-1 bg-transparent text-ink-primary font-mono text-xs focus:outline-none placeholder:text-ink-tertiary"
            />
            <button
              type="submit"
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

function getAgentBadgeStyle(agent: string): string {
  switch (agent) {
    case 'Supervisor':
      return 'bg-surface text-ink-primary border-border';
    case 'Security Agent':
      return 'bg-[#fdf2f2] text-status-error border-[#f5c2c2]';
    case 'Performance Agent':
      return 'bg-[#e8f2fc] text-accent border-[#b3d7f7]';
    case 'Syntax & Refactor Agent':
      return 'bg-[#f0f9f1] text-status-success border-[#c8e6c9]';
    default:
      return 'bg-surface text-ink-secondary border-border-subtle';
  }
}

function getLevelStyle(level: string): string {
  switch (level) {
    case 'WARN':
      return 'text-status-warning';
    case 'ERROR':
      return 'text-status-error';
    case 'SUCCESS':
      return 'text-status-success';
    case 'EXEC':
      return 'text-accent';
    default:
      return 'text-ink-tertiary';
  }
}
