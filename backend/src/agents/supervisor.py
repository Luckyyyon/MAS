import json
import uuid
from typing import List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from src.config import get_llm
from src.models.state import RemediationGraphState, AgentCategory

class SupervisorAgent:
    """
    Supervisor Orchestrator Agent.
    Evaluates AST complexity and metadata to dynamically route tasks across worker agents.
    """

    async def plan_remediation(self, state: RemediationGraphState) -> List[str]:
        """Determine which agents should be triggered for this specific source code."""
        ast_data = state.ast_tree or {}
        imports = [imp.get("module", "") for imp in ast_data.get("imports", [])]
        raw_source = state.source_code.lower()

        # Dynamic routing rules
        selected_agents = ["Security Agent", "Performance Agent", "Maintainability Agent"]
        
        # We can also leverage fast LLM routing if desired
        return selected_agents
