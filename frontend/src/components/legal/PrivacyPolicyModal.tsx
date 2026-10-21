import React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/30 backdrop-blur-xs p-4">
      <div className="bg-surface-elevated border border-border rounded-xl shadow-elevated max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-primary">Privacy Policy</h2>
            <p className="text-xs text-ink-tertiary">Draft for review / Last updated September 2026</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-secondary hover:text-ink-primary text-sm px-2 py-1 rounded-md hover:bg-surface"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs text-ink-secondary leading-relaxed font-sans">
          <section className="space-y-1.5">
            <h3 className="font-semibold text-ink-primary text-sm">1. Core Data Principles</h3>
            <p>
              MAS is designed for developer source code analysis and automated AST patch synthesis. We respect code confidentiality and adhere to a strict minimal-data collection model.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-ink-primary text-sm">2. Source Code Processing</h3>
            <p>
              When you submit source code or Git repositories to MAS:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>AST Parsing:</strong> Structural parsing through Tree-sitter and Python native AST occurs within the active local FastAPI daemon.
              </li>
              <li>
                <strong>Inference:</strong> LLM requests for patch generation are routed either to a self-hosted Ollama instance or the configured Groq API endpoint. Code payloads are used solely for the active session to synthesize diffs and are not retained by MAS for training.
              </li>
              <li>
                <strong>Ephemeral Memory:</strong> Scan history is maintained in active server memory for the duration of the server runtime unless explicitly exported by the operator.
              </li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-ink-primary text-sm">3. No Tracking Cookies</h3>
            <p>
              MAS does not use tracking cookies, cross-site analytics, or third-party marketing pixels. All telemetry displayed in the console reflects real local WebSocket events from the running multi-agent graph.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-semibold text-ink-primary text-sm">4. Enterprise Deployment & Self-Hosting</h3>
            <p>
              Organizations requiring air-gapped security can run MAS entirely on-premise using local Ollama model weights. No telemetry or source code leaves your private network perimeter.
            </p>
          </section>

          <section className="space-y-1.5 border-t border-border-subtle pt-3">
            <p className="text-[11px] text-ink-tertiary">
              * Note: This document is a draft for organizational review. Custom enterprise agreements and Data Processing Addendums (DPAs) supersede this standard policy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-ink-primary text-white text-xs font-medium rounded-lg hover:bg-ink-primary/90"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
