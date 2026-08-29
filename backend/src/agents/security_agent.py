from typing import List, Dict, Any, Optional
from src.agents.base_agent import BaseRemediationAgent
from src.models.state import PatchProposal, AgentCategory

class SecurityAgent(BaseRemediationAgent):
    """Specialized Security Engineer Agent identifying CVE/CWE patterns and generating secure AST patches."""
    
    def __init__(self):
        super().__init__(name="Security Agent", category=AgentCategory.SECURITY)

    async def analyze(self, source_code: str, ast_data: Optional[Dict[str, Any]]) -> List[PatchProposal]:
        system_prompt = """You are a Principal Application Security Engineer and Code Hardening Specialist.
Your objective is to identify critical and high-severity security vulnerabilities in real Python code and synthesize immediate, production-ready secure remediations.

Vulnerabilities to actively identify:
1. SQL Injection (CWE-89): String formatting/concatenation in SQL execution -> Remediate with parameterized queries (?, %s, or ORM parameter binding).
2. Code/Command Injection (CWE-78/CWE-94): Usage of `eval()`, `exec()`, `subprocess.Popen(..., shell=True)`, or `os.system()` -> Remediate with safe subprocess lists or ast.literal_eval.
3. Insecure Deserialization (CWE-502): `pickle.loads()`, `yaml.load()` without SafeLoader -> Remediate with `yaml.safe_load()` or `json`.
4. Weak Cryptography & Secret Leakage (CWE-327/CWE-798): Hardcoded API keys, passwords, MD5/SHA1 for sensitive tokens -> Remediate with constant-time HMAC / SHA256 / environment variables.
5. Insecure Temp Files & Path Traversal (CWE-22/CWE-377): Unsanitized filepath concatenation -> Remediate with `os.path.abspath`, `pathlib.Path`, and base directory sandboxing.

Rules for Proposed Patches:
- The proposed replacement code MUST preserve the exact functional interface and return types.
- Maintain correct Python indentation matching the target scope.
- Only propose patches for genuine, actionable security risks.
"""

        specific_instructions = """Inspect all database queries, deserialization points, system shell calls, dynamic execution, and secret handlers.
Output precise start_line and end_line bounds covering the vulnerable statement or function block."""

        return await self.execute_analysis(source_code, ast_data, system_prompt, specific_instructions)
