from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class AgentCategory(str, Enum):
    MAINTAINABILITY = "Maintainability"
    SECURITY = "Security"
    PERFORMANCE = "Performance"
    SYNTHESIS = "Synthesis & Conflict Resolver"
    SUPERVISOR = "Supervisor Orchestrator"

class PatchSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class PatchProposal(BaseModel):
    """Structured patch emitted by worker LLM agents."""
    id: str = Field(description="Unique UUID for this patch proposal")
    agent: str = Field(description="Agent name (Security Agent, Performance Agent, Maintainability Agent)")
    category: AgentCategory = Field(description="Vulnerability or improvement category")
    vulnerability_type: str = Field(description="Specific type e.g. SQL Injection, Unbounded Loop, Cognitive Complexity")
    severity: PatchSeverity = Field(default=PatchSeverity.MEDIUM)
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    target_symbol: Optional[str] = Field(default=None, description="Function or class name target")
    start_line: int = Field(ge=1, description="1-indexed starting line number in original code")
    end_line: int = Field(ge=1, description="1-indexed ending line number in original code")
    original_code_snippet: str = Field(description="Original code snippet replaced")
    proposed_code: str = Field(description="Patched replacement code")
    reasoning: str = Field(description="Technical rationale explaining why this patch is necessary")
    cwe_id: Optional[str] = Field(default=None, description="Common Weakness Enumeration ID if applicable")

class UnifiedPatchResult(BaseModel):
    """Reconciled unified patch diff ready for frontend review or automated staging."""
    success: bool
    original_file_path: str
    original_code: str
    remediated_code: str
    unified_diff: str
    total_patches_applied: int
    conflicts_resolved: int
    lines_added: int
    lines_removed: int
    syntax_validated: bool
    applied_patches: List[PatchProposal] = Field(default_factory=list)
    conflict_notes: List[str] = Field(default_factory=list)

class StreamLogEvent(BaseModel):
    """Real-time streaming log message emitted across WebSocket."""
    id: str
    timestamp: str
    agent: str
    level: Literal["INFO", "WARN", "ERROR", "EXEC", "SUCCESS"]
    message: str
    step: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class RemediationGraphState(BaseModel):
    """
    Complete typed LangGraph State object tracking multi-agent execution pipeline.
    """
    file_path: str = "source.py"
    source_code: str = ""
    ast_tree: Optional[Dict[str, Any]] = None # Serialized ParsedASTResult
    agent_patches: List[PatchProposal] = Field(default_factory=list)
    unified_patch: Optional[UnifiedPatchResult] = None
    logs: List[StreamLogEvent] = Field(default_factory=list)
    
    # Workflow control flags
    active_agent: Optional[str] = None
    status: Literal["idle", "parsing", "analyzing", "remediating", "resolving", "completed", "error"] = "idle"
    conflicts_detected: bool = False
    error: Optional[str] = None
    selected_targets: List[str] = Field(default_factory=list)
