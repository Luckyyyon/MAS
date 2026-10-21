import React, { useState } from 'react';

interface OverviewShowcaseProps {
  onLaunchWorkbench: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onRunSampleCode: (sampleCode: string, fileName: string) => void;
}

const SAMPLE_VULNERABLE_CODE = `import sqlite3
import yaml
import subprocess

def query_user_records(user_input_id, config_payload):
    # Security Issue: Insecure SQL concatenation
    db = sqlite3.connect("users.db")
    cursor = db.cursor()
    query = "SELECT * FROM users WHERE id = '" + user_input_id + "'"
    cursor.execute(query)
    records = cursor.fetchall()
    
    # Security Issue: Insecure YAML load
    config = yaml.load(config_payload)
    
    # Performance Issue: Quadratic lookup in loop
    valid_ids = [r[0] for r in records]
    filtered_results = []
    for item in records:
        if item[0] in valid_ids:  # O(N^2) linear scan across list
            filtered_results.append(item)
            
    return filtered_results
`;

export const OverviewShowcase: React.FC<OverviewShowcaseProps> = ({
  onLaunchWorkbench,
  onOpenPrivacy,
  onOpenTerms,
  onRunSampleCode,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'performance' | 'maintainability' | 'synthesis'>('security');
  const [isRunningSample, setIsRunningSample] = useState<boolean>(false);

  const handleTestSample = async () => {
    setIsRunningSample(true);
    await onRunSampleCode(SAMPLE_VULNERABLE_CODE, 'src/auth/query_service.py');
    setIsRunningSample(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas text-ink-primary font-sans">
      {/* 1. Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-ink-secondary mb-6 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          <span>AST-Grounded Multi-Agent Remediation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-primary max-w-3xl mx-auto leading-tight">
          Precision code remediation. Grounded in syntax.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          Four specialized agents audit security vulnerabilities, profile algorithmic bottlenecks, and synthesize drop-in AST patches without offset drift.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLaunchWorkbench}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover font-medium text-sm transition-all shadow-subtle"
          >
            Launch Interactive Workbench
          </button>
          <button
            onClick={handleTestSample}
            disabled={isRunningSample}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-surface-elevated text-ink-primary hover:bg-surface border border-border text-sm font-medium transition-all shadow-subtle disabled:opacity-50"
          >
            {isRunningSample ? 'Running Engine Pipeline...' : 'Run Live Sample Audit'}
          </button>
        </div>
      </section>

      {/* 2. Interactive Demonstration Visual Frame */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="bg-surface-elevated border border-border rounded-xl shadow-elevated overflow-hidden">
          {/* Mock Window Header */}
          <div className="h-10 px-4 bg-surface border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5ea]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5ea]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#e5e5ea]" />
              <span className="ml-2 text-xs font-mono text-ink-tertiary">query_service.py — Live AST Diff Comparison</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-status-success bg-[#f0f9f1] px-2 py-0.5 rounded border border-[#c8e6c9]">
                AST Validated
              </span>
            </div>
          </div>

          {/* Side-by-side Product Visual Demo */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border font-mono text-xs">
            {/* Left: Original Code */}
            <div className="p-4 bg-surface/50">
              <div className="flex items-center justify-between text-ink-tertiary text-[11px] mb-2 font-mono">
                <span>BEFORE (VULNERABLE AST)</span>
                <span className="text-status-error font-medium">3 Issues Detected</span>
              </div>
              <pre className="text-ink-secondary leading-relaxed overflow-x-auto text-[11px] p-2 bg-white rounded border border-border-subtle">
{`# 1. SQL Injection vulnerability
query = "SELECT * FROM users WHERE id = '" + user_input_id + "'"
cursor.execute(query)

# 2. Insecure YAML Deserialization
config = yaml.load(config_payload)

# 3. Quadratic lookup in loop (O(N^2))
valid_ids = [r[0] for r in records]
for item in records:
    if item[0] in valid_ids: ...`}
              </pre>
            </div>

            {/* Right: Synthesized AST Patch */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between text-ink-tertiary text-[11px] mb-2 font-mono">
                <span>AFTER (SYNTHESIZED PATCH)</span>
                <span className="text-status-success font-medium">Conflict Merged & Verified</span>
              </div>
              <pre className="text-ink-primary leading-relaxed overflow-x-auto text-[11px] p-2 bg-[#f9fafb] rounded border border-border-subtle">
{`# 1. Parameterized query binding
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_input_id,))

# 2. Safe YAML parser
config = yaml.safe_load(config_payload)

# 3. O(1) set lookup conversion
valid_ids = {r[0] for r in records}
for item in records:
    if item[0] in valid_ids: ...`}
              </pre>
            </div>
          </div>

          {/* Demo Callout */}
          <div className="p-4 bg-surface border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-secondary">
            <span>Bottom-to-top patch application eliminates line offset drift across concurrent agent proposals.</span>
            <button
              onClick={onLaunchWorkbench}
              className="text-accent font-medium hover:underline text-xs flex-shrink-0"
            >
              Open Full Diff Editor →
            </button>
          </div>
        </div>
      </section>

      {/* 3. The 4-Agent Architecture Breakdown */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
              Four specialized agents. One coordinated graph.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-secondary">
              Rather than generic suggestions, each worker focuses exclusively on a concrete domain with strict AST scope validation.
            </p>
          </div>

          {/* Agent Category Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 font-mono text-xs">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'security'
                  ? 'bg-surface-elevated text-ink-primary shadow-subtle border border-border font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Security Agent
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'performance'
                  ? 'bg-surface-elevated text-ink-primary shadow-subtle border border-border font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Performance Agent
            </button>
            <button
              onClick={() => setActiveTab('maintainability')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'maintainability'
                  ? 'bg-surface-elevated text-ink-primary shadow-subtle border border-border font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Syntax & Refactor Agent
            </button>
            <button
              onClick={() => setActiveTab('synthesis')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'synthesis'
                  ? 'bg-surface-elevated text-ink-primary shadow-subtle border border-border font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Supervisor Synthesizer
            </button>
          </div>

          {/* Active Agent Detail Card */}
          <div className="bg-surface-elevated border border-border rounded-xl p-6 sm:p-8 shadow-card">
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-status-error" />
                  <h3 className="text-lg font-semibold text-ink-primary">Security Agent</h3>
                  <span className="text-xs font-mono text-ink-tertiary">CWE-89, CWE-78, CWE-502</span>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Identifies SQL injection, command execution via insecure subprocess calls, unverified YAML/pickle deserialization, and hardcoded credential leaks. Synthesizes drop-in parameterized bindings and safe standard library alternatives.
                </p>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle font-mono text-xs text-ink-primary">
                  <span className="text-ink-tertiary block mb-1">Target AST Nodes:</span>
                  Call (cursor.execute, subprocess.Popen, yaml.load), BinOp (string concatenation in SQL)
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <h3 className="text-lg font-semibold text-ink-primary">Performance Agent</h3>
                  <span className="text-xs font-mono text-ink-tertiary">Algorithmic Profiling</span>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Profiles nested loops causing quadratic time complexity, unbatched I/O operations inside iterations, and unbounded in-memory file streaming. Transforms linear searches into constant-time lookups and introduces batched generators.
                </p>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle font-mono text-xs text-ink-primary">
                  <span className="text-ink-tertiary block mb-1">Target AST Nodes:</span>
                  For (nested loops, loop I/O calls), ListComp (redundant conversions), Compare (in-list scans)
                </div>
              </div>
            )}

            {activeTab === 'maintainability' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-status-success" />
                  <h3 className="text-lg font-semibold text-ink-primary">Syntax & Refactor Agent</h3>
                  <span className="text-xs font-mono text-ink-tertiary">Clean Architecture & PEP 8</span>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Eliminates bare exception handling, dangling unclosed file handles, high cyclomatic complexity, and missing type annotations. Wraps resources in proper context managers and introduces guard clauses.
                </p>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle font-mono text-xs text-ink-primary">
                  <span className="text-ink-tertiary block mb-1">Target AST Nodes:</span>
                  ExceptHandler (bare except:), Try (unscoped error blocks), FunctionDef (type signatures)
                </div>
              </div>
            )}

            {activeTab === 'synthesis' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-ink-primary" />
                  <h3 className="text-lg font-semibold text-ink-primary">Supervisor Synthesizer</h3>
                  <span className="text-xs font-mono text-ink-tertiary">LangGraph Conflict Reconciliation</span>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  When security and performance agents propose edits touching the same line range, the synthesizer groups the proposals into an overlapping cluster and generates a single unified patch. It then validates output with Tree-sitter prior to diff generation.
                </p>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle font-mono text-xs text-ink-primary">
                  <span className="text-ink-tertiary block mb-1">Conflict Strategy:</span>
                  Interval clustering → LLM Meta-Synthesis → ast.parse() syntax validation → Bottom-to-Top application
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Concrete Engineering Principles */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
            Engineered for deterministic execution.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink-secondary">
            Built from first principles for mission-critical codebases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-ink-primary">AST-Grounded Context</div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Every worker receives exact function signatures, variable scopes, and call graphs extracted by Tree-sitter. Agents analyze structural syntax trees rather than unstructured text.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-ink-primary">Zero Line Drift</div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Patches apply in reverse order from the end of the file to the beginning. Earlier patch byte coordinates remain strictly intact throughout multi-patch modifications.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-ink-primary">Syntax Verification Gate</div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              All merged code undergoes mandatory AST syntax parsing before diff creation. Broken syntax or invalid indentations are caught and re-synthesized automatically.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Footer & Legal Links */}
      <footer className="py-12 px-6 border-t border-border bg-surface text-xs text-ink-tertiary">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-ink-primary">MAS</span>
            <span>—</span>
            <span>Autonomous Multi-Agent AST Remediation Engine</span>
          </div>

          <div className="flex items-center space-x-6 text-ink-secondary">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-ink-primary transition-colors underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-ink-primary transition-colors underline"
            >
              Terms of Service
            </button>
            <button
              onClick={onLaunchWorkbench}
              className="hover:text-ink-primary transition-colors"
            >
              Open Workbench
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
