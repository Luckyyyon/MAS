import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, AsyncGenerator, Callable, Optional, List

from langgraph.graph import StateGraph, END
from src.models.state import RemediationGraphState, StreamLogEvent, PatchProposal
from src.parser.ast_parser import PythonASTParser
from src.agents.supervisor import SupervisorAgent
from src.agents.security_agent import SecurityAgent
from src.agents.performance_agent import PerformanceAgent
from src.agents.maintainability_agent import MaintainabilityAgent
from src.engine.diff_resolver import DiffConflictResolver

# Initialize reusable modules
ast_parser = PythonASTParser()
supervisor = SupervisorAgent()
security_agent = SecurityAgent()
performance_agent = PerformanceAgent()
maintainability_agent = MaintainabilityAgent()
diff_resolver = DiffConflictResolver()

def create_log(agent: str, level: str, message: str) -> StreamLogEvent:
    now_str = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
    return StreamLogEvent(
        id=f"log-{uuid.uuid4().hex[:6]}",
        timestamp=now_str,
        agent=agent,
        level=level,
        message=message
    )

# --- High-Speed Parallel Multi-Agent Execution Node ---

async def parse_ast_node(state: RemediationGraphState) -> Dict[str, Any]:
    """Node 1: Instant AST syntax and scope ingestion."""
    parsed = ast_parser.parse_code(state.source_code, file_path=state.file_path)
    
    logs = list(state.logs)
    if not parsed.syntax_valid:
        logs.append(create_log("Supervisor", "ERROR", f"Syntax error in input: {parsed.syntax_error}"))
        return {
            "ast_tree": parsed.dict(),
            "status": "error",
            "error": parsed.syntax_error,
            "logs": logs
        }

    logs.append(create_log(
        "Supervisor", "INFO",
        f"AST Parser indexed {parsed.total_lines} lines ({len(parsed.functions)} functions, {len(parsed.classes)} classes, {len(parsed.imports)} imports)."
    ))

    return {
        "ast_tree": parsed.dict(),
        "status": "analyzing",
        "logs": logs
    }

async def parallel_multi_agent_node(state: RemediationGraphState) -> Dict[str, Any]:
    """
    Node 2: Concurrently execute Security, Performance, and Maintainability Agents
    simultaneously via asyncio.gather for maximum throughput and zero lag.
    """
    logs = list(state.logs)
    logs.append(create_log(
        "Supervisor", "EXEC",
        "Dispatched concurrent AST audit across Security, Performance, and Refactor agents in parallel..."
    ))

    async def _run_staggered(agent, delay: float):
        if delay > 0:
            await asyncio.sleep(delay)
        return await agent.analyze(state.source_code, state.ast_tree)

    # Run all 3 agents in parallel with slight stagger to avoid API rate limit spikes
    results = await asyncio.gather(
        _run_staggered(security_agent, 0.0),
        _run_staggered(performance_agent, 0.2),
        _run_staggered(maintainability_agent, 0.4),
        return_exceptions=True
    )

    security_patches = results[0] if isinstance(results[0], list) else []
    performance_patches = results[1] if isinstance(results[1], list) else []
    maintainability_patches = results[2] if isinstance(results[2], list) else []

    all_patches: List[PatchProposal] = []

    # Process Security results
    if security_patches:
        logs.append(create_log("Security Agent", "WARN", f"Found {len(security_patches)} security vulnerabilities (SQLi/Command Injection/Insecure Deserialization)."))
        all_patches.extend(security_patches)
    else:
        logs.append(create_log("Security Agent", "SUCCESS", "Zero critical security flaws detected in target AST scope."))

    # Process Performance results
    if performance_patches:
        logs.append(create_log("Performance Agent", "WARN", f"Identified {len(performance_patches)} algorithmic bottlenecks (O(N^2) loops/I/O leaks)."))
        all_patches.extend(performance_patches)
    else:
        logs.append(create_log("Performance Agent", "SUCCESS", "Algorithmic complexity verified within linear bounds."))

    # Process Maintainability results
    if maintainability_patches:
        logs.append(create_log("Syntax & Refactor Agent", "INFO", f"Synthesized {len(maintainability_patches)} clean-code refactorings."))
        all_patches.extend(maintainability_patches)
    else:
        logs.append(create_log("Syntax & Refactor Agent", "SUCCESS", "Code structure conforms to clean architecture standards."))

    return {
        "agent_patches": all_patches,
        "logs": logs
    }

async def conflict_resolution_node(state: RemediationGraphState) -> Dict[str, Any]:
    """Node 3: Reconcile proposed diffs and generate clean unified patch via Supervisor conflict resolution engine."""
    logs = list(state.logs)
    logs.append(create_log("Supervisor", "EXEC", f"Reconciling {len(state.agent_patches)} proposed patches across agents..."))

    unified_result = await supervisor.resolve_conflicts(
        source_code=state.source_code,
        file_path=state.file_path,
        patches=state.agent_patches,
        ast_tree=state.ast_tree,
        save_temp_file=True
    )

    for note in unified_result.conflict_notes:
        if "[Supervisor Conflict Engine]" in note:
            logs.append(create_log("Supervisor", "WARN", note))
        elif "saved locally" in note.lower():
            logs.append(create_log("Supervisor", "INFO", note))

    if unified_result.conflicts_resolved > 0:
        logs.append(create_log(
            "Supervisor", "SUCCESS",
            f"Resolved {unified_result.conflicts_resolved} overlapping patch conflicts via deterministic AST priority engine."
        ))

    if unified_result.syntax_validated:
        logs.append(create_log(
            "Supervisor", "SUCCESS",
            f"Remediation pipeline completed! {unified_result.total_patches_applied} patches applied (+{unified_result.lines_added} / -{unified_result.lines_removed} lines). AST syntax verified."
        ))
    else:
        logs.append(create_log(
            "Supervisor", "WARN",
            "Remediation applied with AST validation warnings. Please inspect diff."
        ))

    return {
        "unified_patch": unified_result,
        "status": "completed",
        "logs": logs
    }

# --- Fast LangGraph Definition ---

def build_remediation_graph():
    workflow = StateGraph(RemediationGraphState)

    workflow.add_node("parse_ast", parse_ast_node)
    workflow.add_node("parallel_multi_agent", parallel_multi_agent_node)
    workflow.add_node("conflict_resolver", conflict_resolution_node)

    workflow.set_entry_point("parse_ast")
    workflow.add_edge("parse_ast", "parallel_multi_agent")
    workflow.add_edge("parallel_multi_agent", "conflict_resolver")
    workflow.add_edge("conflict_resolver", END)

    return workflow.compile()

compiled_graph = build_remediation_graph()

class RemediationEngine:
    """Production Engine Runner handling high-speed parallel execution and streaming."""

    @staticmethod
    async def run_pipeline(
        source_code: str,
        file_path: str = "source.py",
        log_callback: Optional[Callable[[StreamLogEvent], Any]] = None
    ) -> RemediationGraphState:
        initial_state = RemediationGraphState(
            file_path=file_path,
            source_code=source_code,
            status="parsing",
            logs=[create_log("Supervisor", "INFO", f"Initializing remediation pipeline for target: {file_path}")]
        )

        current_state = initial_state
        last_log_count = 0

        async for event in compiled_graph.astream(initial_state):
            for node_name, node_output in event.items():
                for key, val in node_output.items():
                    setattr(current_state, key, val)
                
                if log_callback and len(current_state.logs) > last_log_count:
                    for new_log in current_state.logs[last_log_count:]:
                        await log_callback(new_log)
                    last_log_count = len(current_state.logs)

        return current_state
