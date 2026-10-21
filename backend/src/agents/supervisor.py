import json
import uuid
from typing import List, Dict, Any, Optional

from src.models.state import RemediationGraphState, PatchProposal, UnifiedPatchResult
from src.engine.diff_resolver import DiffConflictResolver

class SupervisorAgent:
    """
    Supervisor Orchestrator Agent.
    Evaluates AST complexity and metadata to dynamically route tasks across worker agents,
    and executes deterministic conflict resolution across proposed patches.
    """

    def __init__(self):
        self.conflict_resolver = DiffConflictResolver()

    async def plan_remediation(self, state: RemediationGraphState) -> List[str]:
        """Determine which worker agents should be triggered for this specific source code."""
        ast_data = state.ast_tree or {}
        imports = [imp.get("module", "") for imp in ast_data.get("imports", []) if isinstance(imp, dict)]
        raw_source = state.source_code.lower()

        # Dynamic routing rules - dispatch all 3 core worker agents
        selected_agents = ["Security Agent", "Performance Agent", "Maintainability Agent"]
        return selected_agents

    async def resolve_conflicts(
        self,
        source_code: str,
        file_path: str,
        patches: List[PatchProposal],
        ast_tree: Optional[Dict[str, Any]] = None,
        save_temp_file: bool = True
    ) -> UnifiedPatchResult:
        """
        Supervisor Conflict Resolution Engine:
        Maps proposed JSON patches against the original AST structure and line bounds.
        Applies non-overlapping patches sequentially.
        When patches overlap (e.g. Security on line 12 vs Performance on lines 12-15),
        prioritizes the Security patch and discards lower-priority patches to guarantee safety.
        Saves the final remediated code to temp_patched_file.py.
        """
        return await self.conflict_resolver.resolve_and_apply(
            source_code=source_code,
            file_path=file_path,
            patches=patches,
            ast_tree=ast_tree,
            save_temp_file=save_temp_file
        )
