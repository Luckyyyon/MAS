import React, { useState } from 'react';
import { 
  GitPullRequest, 
  History, 
  Github, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Zap,
  Sliders,
  ChevronRight,
  Search,
  FolderSync
} from 'lucide-react';
import { ScanRecord } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SidebarProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  branch: string;
  setBranch: (branch: string) => void;
  history: ScanRecord[];
  selectedScanId: string | null;
  onSelectScan: (id: string) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  history,
  selectedScanId,
  onSelectScan,
  isScanning,
  onTriggerScan,
}) => {
  const [autoApply, setAutoApply] = useState(false);
  const [strictMode, setStrictMode] = useState(true);

  return (
    <aside className="w-80 h-full border-r border-border bg-[#0a0a0c] flex flex-col select-none flex-shrink-0">
      {/* Target Repo Configuration Section */}
      <div className="p-3 border-b border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-zinc-300">
            <Github className="w-3.5 h-3.5 text-zinc-400" />
            <span>TARGET REPOSITORY</span>
          </div>
          <Badge variant="secondary" className="text-[10px] py-0">LIVE TARGET</Badge>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">GitHub / GitLab URL or Local Path</label>
            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full bg-[#121215] border border-border text-zinc-100 text-xs font-mono px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Branch</label>
              <div className="flex items-center bg-[#121215] border border-border rounded-sm px-2 py-1">
                <GitBranch className="w-3 h-3 text-zinc-500 mr-1.5" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-transparent text-zinc-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Agent Strategy</label>
              <select className="w-full bg-[#121215] border border-border text-zinc-300 text-xs font-mono px-2 py-1 rounded-sm focus:outline-none">
                <option>Multi-Agent (Full)</option>
                <option>Security-Only</option>
                <option>Performance-Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Engine Settings */}
        <div className="pt-2 border-t border-zinc-800/60 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Strict AST Validation</span>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="accent-zinc-200 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Auto-PR on High Confidence</span>
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="accent-zinc-200 cursor-pointer"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-between text-xs font-mono bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
          onClick={onTriggerScan}
          disabled={isScanning}
        >
          <span>{isScanning ? "ORCHESTRATING AGENTS..." : "START AUDIT & FIX"}</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* History of Scans Header */}
      <div className="px-3 py-2 border-b border-border/80 flex items-center justify-between bg-[#0c0c0e]">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-zinc-300">
          <History className="w-3.5 h-3.5 text-zinc-500" />
          <span>REMEDIATION HISTORY</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{history.length} SCANS</span>
      </div>

      {/* Scans List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-1.5 space-y-1">
        {history.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-zinc-600 font-mono text-xs space-y-2">
            <FolderSync className="w-7 h-7 stroke-1 text-zinc-700" />
            <span>No historical scans.</span>
            <span className="text-[10px] text-zinc-600">Click "START AUDIT & FIX" to trigger live execution.</span>
          </div>
        ) : (
          history.map((scan) => {
            const isSelected = scan.id === selectedScanId;
            const repoName = scan.repo_url.split('/').slice(-2).join('/');

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan.id)}
                className={`p-2.5 rounded-sm cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-zinc-900/90 border-zinc-700 text-zinc-100' 
                    : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-850 text-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-mono text-xs font-medium text-zinc-200 truncate max-w-[180px]">
                    {repoName}
                  </span>
                  <Badge variant={scan.status === 'completed' ? 'success' : 'warning'} className="text-[10px] py-0">
                    {scan.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400 mb-1.5">
                  <div className="flex items-center space-x-1">
                    <GitBranch className="w-2.5 h-2.5 text-zinc-500" />
                    <span>{scan.branch}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5 text-zinc-500" />
                    <span>{scan.created_at}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-zinc-800/40 text-[10px] font-mono">
                  <div>
                    <div className="text-zinc-500">FILES</div>
                    <div className="text-zinc-300 font-semibold">{scan.files_scanned}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">VULNS</div>
                    <div className="text-red-400 font-semibold">{scan.vulnerabilities_found}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">PATCHED</div>
                    <div className="text-emerald-400 font-semibold">{scan.patches_generated}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-border/80 bg-[#09090b] flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>ENGINE: Real LangGraph Runtime</span>
        <span className="text-emerald-500">READY</span>
      </div>
    </aside>
  );
};
