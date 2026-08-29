export type AgentType = 
  | 'Supervisor'
  | 'Security Agent'
  | 'Performance Agent'
  | 'Syntax & Refactor Agent';

export type AgentState = 'idle' | 'analyzing' | 'remediating' | 'validating' | 'completed' | 'error';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface AgentStatus {
  name: AgentType;
  state: AgentState;
  current_task: string;
  progress: number;
  model: string;
  last_active: string;
}

export interface RemediationDiff {
  id: string;
  file_path: string;
  language: string;
  severity: Severity;
  category: string;
  agent: AgentType;
  confidence: number;
  description: string;
  vulnerability_details: string;
  remediation_rationale: string;
  original_code: string;
  patched_code: string;
  lines_added: number;
  lines_removed: number;
}

export interface ScanRecord {
  id: string;
  repo_url: string;
  branch: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  created_at: string;
  duration_sec: number;
  files_scanned: number;
  vulnerabilities_found: number;
  patches_generated: number;
  confidence_avg: number;
  primary_agent?: string;
  health_score?: number;
  diffs?: RemediationDiff[];
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  agent: AgentType | 'System';
  level: 'INFO' | 'WARN' | 'ERROR' | 'EXEC' | 'SUCCESS';
  message: string;
}
