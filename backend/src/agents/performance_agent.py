from typing import List, Dict, Any, Optional
from src.agents.base_agent import BaseRemediationAgent
from src.models.state import PatchProposal, AgentCategory

class PerformanceAgent(BaseRemediationAgent):
    """Specialized Systems Performance Engineer identifying bottlenecks, I/O leaks, and O(N^2) loops."""
    
    def __init__(self):
        super().__init__(name="Performance Agent", category=AgentCategory.PERFORMANCE)

    async def analyze(self, source_code: str, ast_data: Optional[Dict[str, Any]]) -> List[PatchProposal]:
        system_prompt = """You are a Principal Performance and High-Throughput Systems Engineer.
Your objective is to identify algorithmic inefficiencies, I/O bottlenecks, and memory overhead in real Python code and synthesize optimized replacements.

Performance Patterns to actively remediate:
1. Quadratic / O(N^2) Nested Iterations: Repeated list `in` lookups inside loops -> Convert to `set` or `dict` lookups (O(1) average time).
2. Redundant I/O inside Loops: Opening files, executing queries, or establishing network connections inside iteration blocks -> Batch I/O or lift operations outside loop.
3. Unbounded Memory Usage: `.read()` or `.readlines()` on arbitrary files -> Replace with generator streams or chunked iteration.
4. String Concatenation in Loops: `+=` in loops -> Replace with `''.join(...)` or string buffers.
5. Missing Caching / Memoization: Repeatedly computing expensive idempotent calculations -> Introduce `functools.lru_cache` or local cache dictionaries.
6. Blocking Calls in Async code: Using `time.sleep()` or synchronous `requests` in `async def` -> Remediate with `asyncio.sleep()` or `httpx.AsyncClient`.

Rules for Proposed Patches:
- The replacement code MUST maintain 100% output equivalence and handle edge cases gracefully.
- Preserve original indentation and typing.
"""

        specific_instructions = """Inspect loops, data structure lookups, file/network I/O, and recursion.
Synthesize clean, optimized replacement code with measurable speedup or memory footprint reduction."""

        return await self.execute_analysis(source_code, ast_data, system_prompt, specific_instructions)
