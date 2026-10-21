import React, { useState } from 'react';
import { ScanRecord } from '../../types';

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
  const [inputMode, setInputMode] = useState<'github' | 'local'>('github');
  const [strictMode, setStrictMode] = useState<boolean>(true);
  const [autoPR, setAutoPR] = useState<boolean>(false);

  const presets = {
    github: [
      { label: 'Payment Gateway Sample', url: 'https://github.com/enterprise-org/core-payment-gateway' },
      { label: 'FastAPI Router', url: 'https://github.com/tiangolo/fastapi' },
      { label: 'Requests Auth Service', url: 'https://github.com/psf/requests/blob/main/src/requests/auth.py' },
    ],
    local: [
      { label: 'backend/main.py', url: 'backend/main.py' },
      { label: 'src/api/routes.py', url: 'backend/src/api/routes.py' },
      { label: 'src/parser/ast_parser.py', url: 'backend/src/parser/ast_parser.py' },
    ]
  };

  return (
    <aside className="w-80 h-full border-r border-border bg-surface flex flex-col select-none flex-shrink-0 font-sans">
      {/* Target Source Configuration */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            Target Source
          </span>
          <span className="text-[11px] font-mono text-ink-tertiary bg-surface-subtle px-2 py-0.5 rounded border border-border-subtle">
            Active Target
          </span>
        </div>

        {/* Source Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs">
          <button
            type="button"
            onClick={() => {
              setInputMode('github');
              if (!repoUrl.startsWith('http')) {
                setRepoUrl('https://github.com/enterprise-org/core-payment-gateway');
              }
            }}
            className={`py-1 rounded-md font-medium transition-all ${
              inputMode === 'github'
                ? 'bg-surface-elevated text-ink-primary shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Remote Git
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('local');
              if (repoUrl.startsWith('http')) {
                setRepoUrl('backend/main.py');
              }
            }}
            className={`py-1 rounded-md font-medium transition-all ${
              inputMode === 'local'
                ? 'bg-surface-elevated text-ink-primary shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Local File
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-secondary block mb-1">
              {inputMode === 'github' ? 'Repository or File URL' : 'File or Directory Path'}
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={inputMode === 'github' ? 'https://github.com/org/repo' : 'e.g. backend/main.py'}
              className="w-full bg-surface-elevated border border-border text-ink-primary text-xs font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-accent shadow-subtle placeholder:text-ink-tertiary"
            />
            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(inputMode === 'github' ? presets.github : presets.local).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRepoUrl(p.url)}
                  className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-elevated hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary border border-border-subtle rounded transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-ink-secondary block mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-surface-elevated border border-border text-ink-primary text-xs font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-accent shadow-subtle"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-secondary block mb-1">Strategy</label>
              <select className="w-full bg-surface-elevated border border-border text-ink-primary text-xs font-sans px-2 py-1.5 rounded-lg focus:outline-none focus:border-accent shadow-subtle">
                <option>Multi-Agent (Full)</option>
                <option>Security-Only</option>
                <option>Performance-Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Engine Checkbox Toggles */}
        <div className="pt-2 border-t border-border space-y-2 text-xs">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-ink-secondary">Strict AST Validation</span>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="accent-accent cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-ink-secondary">Auto-PR Staging</span>
            <input
              type="checkbox"
              checked={autoPR}
              onChange={(e) => setAutoPR(e.target.checked)}
              className="accent-accent cursor-pointer"
            />
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="w-full py-2 px-3 rounded-lg bg-ink-primary text-white hover:bg-ink-primary/90 font-medium text-xs transition-all shadow-subtle disabled:opacity-40"
        >
          {isScanning ? 'Orchestrating Agents...' : 'Start Audit & Fix'}
        </button>
      </div>

      {/* Remediation History */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-surface-subtle">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
          Scan History
        </span>
        <span className="text-[11px] font-mono text-ink-tertiary">{history.length} runs</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
        {history.length === 0 ? (
          <div className="p-6 text-center text-ink-tertiary text-xs space-y-1">
            <p className="font-medium text-ink-secondary">No recorded scans</p>
            <p className="text-[11px]">Click "Start Audit & Fix" to trigger the multi-agent pipeline.</p>
          </div>
        ) : (
          history.map((scan) => {
            const isSelected = scan.id === selectedScanId;
            const repoName = scan.repo_url.split('/').slice(-2).join('/');

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-surface-elevated border-border-strong text-ink-primary shadow-subtle'
                    : 'bg-transparent border-transparent hover:bg-surface-elevated/60 text-ink-secondary'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-mono text-xs font-medium text-ink-primary truncate max-w-[170px]">
                    {repoName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-ink-secondary">
                    {scan.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-[11px] font-mono text-ink-tertiary mb-1.5">
                  <span>{scan.branch}</span>
                  <span>•</span>
                  <span>{scan.created_at}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-border-subtle text-[10px] font-mono">
                  <div>
                    <span className="text-ink-tertiary">FILES: </span>
                    <span className="text-ink-primary font-medium">{scan.files_scanned}</span>
                  </div>
                  <div>
                    <span className="text-ink-tertiary">VULNS: </span>
                    <span className="text-status-error font-medium">{scan.vulnerabilities_found}</span>
                  </div>
                  <div>
                    <span className="text-ink-tertiary">PATCH: </span>
                    <span className="text-status-success font-medium">{scan.patches_generated}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between text-[11px] font-mono text-ink-tertiary">
        <span>LangGraph Runtime</span>
        <span className="text-status-success">Ready</span>
      </div>
    </aside>
  );
};
