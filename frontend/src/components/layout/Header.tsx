import React from 'react';

interface HeaderProps {
  currentRepo: string;
  currentBranch: string;
  isScanning: boolean;
  onTriggerScan: () => void;
  wsConnected: boolean;
  activeView: 'showcase' | 'workbench';
  setActiveView: (view: 'showcase' | 'workbench') => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRepo,
  currentBranch,
  isScanning,
  onTriggerScan,
  wsConnected,
  activeView,
  setActiveView,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <header className="h-13 border-b border-border/80 bg-surface-elevated/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => setActiveView('showcase')}
          className="flex items-center space-x-2.5 text-left group"
        >
          <div className="w-7 h-7 bg-ink-primary text-white flex items-center justify-center rounded-lg font-mono font-semibold text-xs transition-transform group-hover:scale-[1.02]">
            MAS
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-ink-primary">
              Multi-Agent Engine
            </div>
            <div className="text-[11px] text-ink-tertiary hidden sm:block">
              Autonomous AST Code Remediation
            </div>
          </div>
        </button>

        {/* View Mode Switcher */}
        <nav className="flex items-center bg-surface border border-border-subtle p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveView('showcase')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeView === 'showcase'
                ? 'bg-surface-elevated text-ink-primary shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('workbench')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeView === 'workbench'
                ? 'bg-surface-elevated text-ink-primary shadow-subtle'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Interactive Workbench
          </button>
        </nav>
      </div>

      {/* Target Repo Quick Info (When in Workbench) */}
      {activeView === 'workbench' && (
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono bg-surface border border-border-subtle px-3 py-1 rounded-lg">
          <span className="text-ink-tertiary">TARGET:</span>
          <span className="text-ink-primary font-medium truncate max-w-[200px]">
            {currentRepo.replace('https://github.com/', '')}
          </span>
          <span className="text-border">:</span>
          <span className="text-ink-secondary">{currentBranch}</span>
        </div>
      )}

      {/* Right Actions & Health Status */}
      <div className="flex items-center space-x-4">
        {/* Daemon Connection Indicator */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-status-success ring-4 ring-status-success/15' : 'bg-status-warning ring-4 ring-status-warning/15'
            }`}
          />
          <span className="text-ink-tertiary hidden md:inline">
            {wsConnected ? 'Daemon Online' : 'Daemon Standby'}
          </span>
        </div>

        {/* Primary Action Button */}
        {activeView === 'workbench' ? (
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="h-8 px-4 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-subtle disabled:opacity-40 disabled:pointer-events-none"
          >
            {isScanning ? 'Running Analysis...' : 'Run Remediation'}
          </button>
        ) : (
          <button
            onClick={() => setActiveView('workbench')}
            className="h-8 px-4 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-subtle"
          >
            Open Workbench
          </button>
        )}
      </div>
    </header>
  );
};
