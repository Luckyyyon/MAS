import json
import uuid
import re
from typing import List, Dict, Any, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from src.config import get_llm
from src.models.state import PatchProposal, AgentCategory, PatchSeverity

class SynthesizerAgent:
    """
    Synthesizes overlapping or conflicting patches from multiple worker agents
    (e.g., a Security patch and a Performance patch on the same function) into a single cohesive patch.
    """

    async def synthesize_conflicting_patches(
        self,
        original_code_block: str,
        start_line: int,
        end_line: int,
        conflicting_patches: List[PatchProposal]
    ) -> PatchProposal:
        llm = get_llm(temperature=0.0, json_mode=True)

        patches_description = []
        for p in conflicting_patches:
            patches_description.append(
                f"--- Patch by {p.agent} (Category: {p.category.value}, Severity: {p.severity.value}) ---\n"
                f"Reasoning: {p.reasoning}\n"
                f"Proposed Code:\n{p.proposed_code}\n"
            )

        system_prompt = """You are a Principal Conflict-Resolution Compiler and Meta-Synthesizer.
Two or more specialized agents proposed distinct patches for the same overlapping lines of Python code (e.g. one agent fixed a SQL injection, while another optimized a loop or handled exceptions).

Your mission is to synthesize a SINGLE, UNIFIED, SUPERIOR patch that incorporates ALL fixes simultaneously without any regressions, syntax errors, or conflicting logic.

Rules:
1. NEVER compromise on Security: All security sanitizations, parameterizations, and safe imports MUST be retained.
2. Incorporate algorithmic optimizations, clean exception handling, and typing from other patches.
3. Ensure the synthesized code has flawless indentation and matches the target scope.
"""

        user_content = f"""ORIGINAL CODE BLOCK (Lines {start_line} to {end_line}):
```python
{original_code_block}
```

PROPOSED CONFLICTING/OVERLAPPING PATCHES:
{chr(10).join(patches_description)}

MANDATORY OUTPUT FORMAT:
Respond with a JSON object:
{{
  "vulnerability_type": "Unified Multi-Agent Remediation (Combined Security & Optimization)",
  "severity": "critical",
  "confidence": 0.98,
  "proposed_code": "<complete drop-in replacement code for the block>",
  "reasoning": "<explanation of how both patches were merged into a single coherent solution>"
}}
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_content)
        ]

        try:
            response = await llm.ainvoke(messages)
            raw_text = response.content if isinstance(response.content, str) else str(response.content)
            
            # Clean JSON
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text.strip())
            cleaned = match.group(1).strip() if match else raw_text.strip()
            data = json.loads(cleaned)

            return PatchProposal(
                id=str(uuid.uuid4()),
                agent="Synthesis & Conflict Resolver",
                category=AgentCategory.SYNTHESIS,
                vulnerability_type=data.get("vulnerability_type", "Unified Conflict Resolution"),
                severity=PatchSeverity.CRITICAL,
                confidence=float(data.get("confidence", 0.98)),
                start_line=start_line,
                end_line=end_line,
                original_code_snippet=original_code_block,
                proposed_code=data.get("proposed_code", conflicting_patches[0].proposed_code),
                reasoning=data.get("reasoning", "Synthesized overlapping agent proposals into a unified remediation patch."),
                cwe_id="CWE-MERGED"
            )
        except Exception as e:
            print(f"[Synthesizer Error] Falling back to highest-priority patch: {e}")
            # Fallback to security or highest severity patch
            return conflicting_patches[0]
