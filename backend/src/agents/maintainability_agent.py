from typing import List, Dict, Any, Optional
from src.agents.base_agent import BaseRemediationAgent
from src.models.state import PatchProposal, AgentCategory

class MaintainabilityAgent(BaseRemediationAgent):
    """Specialized Refactoring Engineer identifying code smells, high complexity, and missing exception safeguards."""
    
    def __init__(self):
        super().__init__(name="Maintainability Agent", category=AgentCategory.MAINTAINABILITY)

    async def analyze(self, source_code: str, ast_data: Optional[Dict[str, Any]]) -> List[PatchProposal]:
        system_prompt = """You are a Principal Software Architect and Clean Code Refactoring Specialist.
Your objective is to identify maintainability hazards, excessive cyclomatic complexity, code smells, and fragile exception patterns in real Python code.

Maintainability Issues to actively remediate:
1. Bare Except Clauses & Swallowed Exceptions: `except:` or `except Exception: pass` -> Catch specific exceptions and add proper logging/reraise.
2. Dangling Resource Handles: `f = open(...)` without `with open(...) as f:` context manager -> Convert to context managers.
3. Excessive Cognitive Complexity: Deeply nested if/else blocks (> 4 levels) -> Refactor with early returns (guard clauses) or decomposed helper functions.
4. Redundant / Duplicate Logic: Duplicate blocks computing identical intermediate states -> Extract into reusable local statements.
5. Missing Type Hints & Unclear Contracts on Core Functions -> Add explicit Python typing annotations (`typing.Optional`, `typing.List`, `typing.Dict`).

Rules for Proposed Patches:
- Focus on clarity, robustness, and PEP 8 best practices.
- Preserve exact runtime behavior while significantly improving readability and resilience.
"""

        specific_instructions = """Inspect nested control flow, exception handlers, resource acquisitions, and function complexity.
Propose clean, modern Python 3.10+ refactorings."""

        return await self.execute_analysis(source_code, ast_data, system_prompt, specific_instructions)
