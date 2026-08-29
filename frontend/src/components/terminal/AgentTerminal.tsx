import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  CornerDownLeft, 
  Shield, 
  Cpu, 
  Zap, 
  Code2,
  CheckCircle2,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { TerminalLog, AgentType } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
    a.download = `agent-telemetry-${Date.now()}.log`;
    a.click();
  };

  return (
    <div className="border-t border-border bg-[#08080a] flex flex-col transition-all duration-200 select-none">
      {/* Terminal Top Control Bar */}
      <div className="h-8 px-3 border-b border-border/80 bg-[#0c0c0e] flex items-center justify-between">
        {/* Title & Live Status */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 font-mono text-xs font-semibold text-zinc-300">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>AGENT TELEMETRY & CLI CONSOLE</span>
          </div>

          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-zinc-500">{isStreaming ? 'STREAMING' : 'IDLE'}</span>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Agent Filter Selector */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-sm px-1.5 py-0.5">
            <Filter className="w-2.5 h-2.5 text-zinc-500" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-transparent text-zinc-300 text-[10px] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Agents</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Security Agent">Security Agent</option>
              <option value="Performance Agent">Performance Agent</option>
              <option value="Syntax & Refactor Agent">Syntax Agent</option>
            </select>
          </div>

          {/* Auto-scroll lock */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded-sm border text-[10px] ${
              autoScroll ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-transparent border-zinc-800 text-zinc-500'
            }`}
            title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
          >
            {autoScroll ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            className="p-1 rounded-sm border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* Export */}
          <button
            onClick={exportLogs}
            className="p-1 rounded-sm border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Export logs"
          >
            <Download className="w-3 h-3" />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-sm border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            {isCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!isCollapsed && (
        <div className="flex flex-col h-48">
          {/* Logs Output View */}
          <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-[#070709]">
            {filteredLogs.length === 0 ? (
              <div className="text-zinc-600 text-xs italic">No telemetry messages received.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed hover:bg-zinc-900/40 px-1 rounded-sm">
                  <span className="text-zinc-600 select-none flex-shrink-0 text-[11px]">{log.timestamp}</span>
                  <span className={`text-[10px] px-1 py-0 rounded-sm border flex-shrink-0 font-medium ${getAgentBadgeStyle(log.agent)}`}>
                    {log.agent}
                  </span>
                  <span className={`text-[10px] font-bold flex-shrink-0 ${getLevelStyle(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className="text-zinc-300 break-all select-text font-sans md:font-mono text-xs">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* CLI Prompt Input Line */}
          <form onSubmit={handleCommandSubmit} className="h-8 border-t border-zinc-900 bg-[#09090b] px-3 flex items-center space-x-2">
            <span className="text-zinc-500 font-mono text-xs select-none">agent@remediation:~$</span>
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="Inject supervisor prompt (e.g. 're-verify memory leak with strict AST boundary' or 'rerun security')..."
              className="flex-1 bg-transparent text-zinc-100 font-mono text-xs focus:outline-none placeholder:text-zinc-700"
            />
            <button
              type="submit"
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
              title="Execute command"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
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
      return 'bg-purple-950/40 text-purple-300 border-purple-800/60';
    case 'Security Agent':
      return 'bg-rose-950/40 text-rose-300 border-rose-800/60';
    case 'Performance Agent':
      return 'bg-blue-950/40 text-blue-300 border-blue-800/60';
    case 'Syntax & Refactor Agent':
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60';
    default:
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
}

function getLevelStyle(level: string): string {
  switch (level) {
    case 'WARN':
      return 'text-amber-400';
    case 'ERROR':
      return 'text-red-400';
    case 'SUCCESS':
      return 'text-emerald-400';
    case 'EXEC':
      return 'text-purple-400';
    default:
      return 'text-zinc-500';
  }
}
