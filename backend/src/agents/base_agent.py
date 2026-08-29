import json
import uuid
import re
from typing import List, Dict, Any, Type, Optional
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from src.config import get_llm
from src.models.state import PatchProposal, AgentCategory, PatchSeverity

class AgentPatchOutputSchema(BaseModel):
    """Pydantic schema for structured worker agent JSON output."""
    proposals: List[PatchProposal] = Field(default_factory=list)

class BaseRemediationAgent:
    """Base class for specialized LLM remediation agents with AST context injection."""
    
    def __init__(self, name: str, category: AgentCategory):
        self.name = name
        self.category = category

    def _build_ast_context(self, ast_data: Optional[Dict[str, Any]]) -> str:
        """Format extracted AST metadata into concise technical prompt context."""
        if not ast_data:
            return "No AST metadata available."
        
        functions = ast_data.get("functions", [])
        classes = ast_data.get("classes", [])
        imports = ast_data.get("imports", [])
        
        summary_lines = [
            f"Total Lines: {ast_data.get('total_lines', 0)}",
            "Extracted Symbols & Hierarchy:"
        ]
        for c in classes:
            summary_lines.append(f"- Class `{c.get('name')}` (Lines {c.get('start_line')}-{c.get('end_line')}): Methods = {', '.join(c.get('methods', []))}")
        for f in functions:
            summary_lines.append(f"- Function `{f.get('qualified_name')}` (Lines {f.get('start_line')}-{f.get('end_line')}): Params = {f.get('parameters')}, Calls = {f.get('calls_made')}")
        
        return "\n".join(summary_lines)

    def _clean_json_response(self, text: str) -> str:
        """Extract and clean raw JSON from LLM markdown fenced codeblocks."""
        text = text.strip()
        # Remove ```json ... ``` wrapper
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        return text

    async def execute_analysis(
        self,
        source_code: str,
        ast_data: Optional[Dict[str, Any]],
        system_prompt: str,
        specific_instructions: str
    ) -> List[PatchProposal]:
        """Execute real LLM call against source code with strict JSON extraction."""
        llm = get_llm(temperature=0.1, json_mode=True)
        ast_summary = self._build_ast_context(ast_data)

        # Number lines for explicit token positioning
        numbered_lines = "\n".join(
            f"{i+1:4d} | {line}" for i, line in enumerate(source_code.splitlines())
        )

        user_content = f"""AST STRUCTURAL METADATA:
{ast_summary}

RAW SOURCE CODE (WITH 1-INDEXED LINE NUMBERS):
```python
{numbered_lines}
```

SPECIFIC AUDIT FOCUS:
{specific_instructions}

MANDATORY OUTPUT FORMAT:
You MUST respond with a JSON object strictly matching this schema:
{{
  "proposals": [
    {{
      "id": "unique-uuid-or-string",
      "agent": "{self.name}",
      "category": "{self.category.value}",
      "vulnerability_type": "Specific Issue Name",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "confidence": 0.95,
      "target_symbol": "function_or_class_name",
      "start_line": <1-indexed start line integer to replace>,
      "end_line": <1-indexed end line integer to replace>,
      "original_code_snippet": "<verbatim exact snippet between start_line and end_line>",
      "proposed_code": "<exact drop-in remediated replacement code preserving indentation>",
      "reasoning": "<concise explanation of the AST transformation and fix>",
      "cwe_id": "CWE-XYZ or null"
    }}
  ]
}}
If NO actionable issues are found, return {{"proposals": []}}.
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_content)
        ]

        try:
            response = await llm.ainvoke(messages)
            raw_text = response.content if isinstance(response.content, str) else str(response.content)
            cleaned_json = self._clean_json_response(raw_text)
            parsed_data = json.loads(cleaned_json)
            
            # Parse into validated Pydantic models
            proposals: List[PatchProposal] = []
            for item in parsed_data.get("proposals", []):
                item["id"] = item.get("id") or str(uuid.uuid4())
                item["agent"] = self.name
                item["category"] = self.category.value
                
                # Sanitize line bounds
                start_l = max(1, int(item.get("start_line", 1)))
                end_l = max(start_l, int(item.get("end_line", start_l)))
                item["start_line"] = start_l
                item["end_line"] = end_l
                
                patch = PatchProposal(**item)
                proposals.append(patch)
                
            return proposals
        except Exception as e:
            print(f"[{self.name} ERROR] Failed to execute LLM analysis: {e}")
            return []
