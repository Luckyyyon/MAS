from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class AgentType(str, Enum):
    SUPERVISOR = "Supervisor"
    SECURITY = "Security Agent"
    PERFORMANCE = "Performance Agent"
    SYNTAX = "Syntax & Refactor Agent"

class AgentState(str, Enum):
    IDLE = "idle"
    ANALYZING = "analyzing"
    REMEDIATING = "remediating"
    VALIDATING = "validating"
    COMPLETED = "completed"
    ERROR = "error"

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ScanRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = "main"
    auto_remediate: Optional[bool] = True

class AgentStatus(BaseModel):
    name: AgentType
    state: AgentState
    current_task: str
    progress: int # 0 - 100
    model: str
    last_active: str

class RemediationDiff(BaseModel):
    id: str
    file_path: str
    language: str
    severity: Severity
    category: str # "Security", "Performance", "Deadlock", "Syntax"
    agent: AgentType
    confidence: float
    description: str
    vulnerability_details: str
    remediation_rationale: str
    original_code: str
    patched_code: str
    lines_added: int
    lines_removed: int

class ScanSummary(BaseModel):
    id: str
    repo_url: str
    branch: str
    status: str # "running" | "completed" | "failed"
    created_at: str
    duration_sec: int
    files_scanned: int
    vulnerabilities_found: int
    patches_generated: int
    confidence_avg: float
    diffs: List[RemediationDiff]

class TerminalLog(BaseModel):
    timestamp: str
    agent: AgentType
    level: str # "INFO" | "WARN" | "ERROR" | "EXEC" | "SUCCESS"
    message: str
    metadata: Optional[Dict[str, Any]] = None
