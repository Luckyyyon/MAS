# Autonomous Multi-Agent Code Remediation Engine
## Comprehensive Architectural & Technical Report: Phase 1 & Phase 2

---

## 1. Executive Summary

The **Autonomous Multi-Agent Code Remediation Engine** is an enterprise-grade developer tool designed to autonomously inspect, analyze, and remediate source code vulnerabilities, performance bottlenecks, and architectural debt.

Unlike traditional static analysis tools that only output warning logs, this system utilizes a **multi-agent LangGraph workflow** backed by **Tree-sitter AST parsing** and **ultra-fast LLM inference (Groq / Ollama)** to synthesize drop-in, syntax-validated AST patches with deterministic conflict resolution.

---

## 2. Phase 1: Enterprise Frontend Architecture & UX Design System

### 2.1 Design Philosophy & Visual Tokens
* **Aesthetic Standard**: Modeled after modern enterprise developer platforms (Linear, Vercel, Cursor).
* **Palette**: Matte dark mode (`#09090b` zinc background, `#0f0f11` card surfaces, `#27272a` sharp structural borders).
* **Typography**:
  - **UI / Headings**: Inter / Geist sans-serif font family.
  - **Code & Logs**: JetBrains Mono for exact character alignment and diff readability.
* **Micro-interactions**: High-contrast monochrome accents, purposeful status pills (Emerald, Amber, Rose, Purple), zero glowing gradients or distracting animations.

---

### 2.2 Frontend Component Topology

```
frontend/src/
├── App.tsx                              # Master application composition & real state synchronization
├── main.tsx                             # React 18 DOM mount point
├── index.css                            # Global CSS variables, scrollbars & Monaco theme overrides
├── types/index.ts                       # Domain types (RemediationDiff, AgentStatus, ScanRecord, etc.)
├── hooks/
│   └── useAgentStream.ts                # WebSocket telemetry client with auto-reconnect & payload callbacks
└── components/
    ├── layout/
    │   ├── Header.tsx                   # Top navigation, target branch badge, daemon health & scan trigger
    │   └── Sidebar.tsx                  # Target Git repository config, AST toggles, and live history list
    ├── dashboard/
    │   └── AgentStatusPanel.tsx         # Real-time multi-agent topology grid with progress & active subtasks
    ├── diff-viewer/
    │   ├── FileListSelector.tsx         # Remediated files selector with severity tags & +/- line counters
    │   ├── DiffCodeViewer.tsx           # Monaco Diff Editor (Split-Pane vs. Unified view) + Empty states
    │   └── RemediationExplanation.tsx   # Vulnerability breakdown, AST rationale & Accept/Reject actions
    ├── terminal/
    │   └── AgentTerminal.tsx            # High-performance CLI console, agent filters, log export & CLI prompt
    └── ui/
        ├── badge.tsx                    # Sharp-bordered status and agent badges
        ├── button.tsx                   # Matte developer buttons
        └── card.tsx                     # Container panels
```

---

### 2.3 Key Interface Modules & Capabilities

1. **Header ([`Header.tsx`](file:///d:/MAS/frontend/src/components/layout/Header.tsx))**:
   - Displays real-time WebSocket connection state (`DAEMON ONLINE` / `DAEMON STANDBY`).
   - Repository quick-info bar with active Git branch indicator.
   - Primary `RUN REMEDIATION` orchestration trigger.

2. **Sidebar ([`Sidebar.tsx`](file:///d:/MAS/frontend/src/components/layout/Sidebar.tsx))**:
   - Inputs for target GitHub/GitLab URL, target branch, and agent strategy selection.
   - Settings toggles for *Strict AST Validation* and *Auto-PR on High Confidence*.
   - Live remediation history feed listing duration, scanned files, and patch counts.

3. **Top Agent Orchestration Panel ([`AgentStatusPanel.tsx`](file:///d:/MAS/frontend/src/components/dashboard/AgentStatusPanel.tsx))**:
   - Displays all 4 agents (*Supervisor*, *Security Agent*, *Performance Agent*, *Syntax & Refactor Agent*).
   - Live state pills (`idle`, `analyzing`, `remediating`, `validating`, `completed`).
   - Real-time progress bars, assigned LLM models, and global KPIs (AST Vulns, Patches, Confidence).

4. **Central Monaco Split-Pane Diff Viewer ([`DiffCodeViewer.tsx`](file:///d:/MAS/frontend/src/components/diff-viewer/DiffCodeViewer.tsx))**:
   - Production `@monaco-editor/react` Diff Editor comparing original vulnerable code against synthesized agent patches.
   - Switchable `SPLIT` (side-by-side) and `UNIFIED` (inline) viewing modes.
   - Rationale bar with *Accept Patch*, *Reject*, and *Re-Synthesize* triggers.

5. **Live Agent CLI Terminal ([`AgentTerminal.tsx`](file:///d:/MAS/frontend/src/components/terminal/AgentTerminal.tsx))**:
   - Low-overhead live streaming feed color-coded by log levels (`[INFO]`, `[WARN]`, `[ERROR]`, `[EXEC]`, `[SUCCESS]`).
   - Agent-specific filtering, auto-scroll lock/unlock, one-click `.log` exporter.
   - Interactive prompt allowing developers to send direct instructions to the Supervisor agent.

---

## 3. Phase 2: Production Multi-Agent Backend & Real AI Engine

```
backend/
├── main.py                              # FastAPI daemon with CORS, REST, and WebSocket streaming
├── requirements.txt                     # Production Python dependencies
├── .env                                 # Groq API configuration & engine parameters
└── src/
    ├── config.py                        # LLM factory (Groq / Ollama switch, temperature, token limits)
    ├── parser/
    │   └── ast_parser.py                # Tree-sitter & Python AST parser extracting scopes & call graphs
    ├── models/
    │   └── state.py                     # Pydantic v2 & LangGraph state definitions
    ├── agents/
    │   ├── base_agent.py                # Base agent with AST context injection & JSON schema validation
    │   ├── security_agent.py            # Security Agent (SQLi, Command Inj, Deserialization, Crypto)
    │   ├── performance_agent.py         # Performance Agent (O(N^2) loops, I/O in loops, memory streams)
    │   ├── maintainability_agent.py     # Maintainability Agent (Complexity, bare excepts, typing)
    │   ├── supervisor.py                # Supervisor Orchestrator (Dynamic scheduling & routing)
    │   └── synthesizer.py               # Meta-Synthesizer for reconciling overlapping patch conflicts
    ├── engine/
    │   ├── diff_resolver.py             # Algorithmic patch merger, overlap clusterer & diff generator
    │   └── workflow.py                  # Compiled LangGraph parallel execution engine
    └── api/
        ├── routes.py                    # REST endpoints (AST parsing, direct code, file upload, history)
        └── ws_handler.py                # WebSocket real-time telemetry and unified diff broadcaster
```

---

### 3.1 Real AST Parser Module ([`src/parser/ast_parser.py`](file:///d:/MAS/backend/src/parser/ast_parser.py))
* Combines **Tree-sitter Python bindings** with Python's native `ast` library.
* Extracts full syntactic hierarchies:
  - Function and class definitions with exact 1-indexed line numbers and byte offsets.
  - Parameter signatures, decorators, docstrings, variable assignments, and async identifiers.
  - Inter-function dependency graphs (`call_graph`, `imports`, and `global_variables`).

---

### 3.2 Production State Definition ([`src/models/state.py`](file:///d:/MAS/backend/src/models/state.py))
Strict Pydantic v2 domain models tracking the complete remediation lifecycle:
* **`PatchProposal`**: Captures `start_line`, `end_line`, `original_code_snippet`, `proposed_code`, `reasoning`, `vulnerability_type`, `severity`, `confidence`, and `cwe_id`.
* **`UnifiedPatchResult`**: Captures reconciled diffs, `conflicts_resolved`, `lines_added`, `lines_removed`, applied patch list, and `syntax_validated`.
* **`StreamLogEvent`**: Standardized WebSocket streaming event model.
* **`RemediationGraphState`**: LangGraph state container managing the agent graph execution context.

---

### 3.3 Specialized Worker Agents ([`src/agents/`](file:///d:/MAS/backend/src/agents/))

| Agent | Target Vulnerabilities & Code Smells | Remediation Strategy |
| :--- | :--- | :--- |
| **Security Agent** | SQLi (CWE-89), Command Injection (CWE-78), Insecure Deserialization (CWE-502), Broken Crypto (CWE-327), Secret Leakage (CWE-798) | Synthesizes parameterized DB-API queries, safe subprocess lists, safe YAML loaders, and SHA-256 HMAC tokens. |
| **Performance Agent** | Quadratic $O(N^2)$ nested lookups, redundant loop I/O, unbounded memory `.read()`, blocking calls in async | Converts linear scans to $O(1)$ set/dict lookups, batches I/O outside loops, and introduces streaming generators. |
| **Maintainability Agent**| Bare `except:` clauses, dangling file handles, high cyclomatic complexity, missing type hints | Refactors into explicit error handlers, `with open(...)` context managers, guard clauses, and PEP 484 type annotations. |
| **Synthesizer Agent** | Overlapping or conflicting patch suggestions touching identical line numbers | Meta-LLM step that merges security hardening and performance optimizations into a single cohesive patch. |

---

### 3.4 Algorithmic Diff Conflict Resolver ([`src/engine/diff_resolver.py`](file:///d:/MAS/backend/src/engine/diff_resolver.py))
1. **Overlap Detection**: Discovers intersecting $[start\_line, end\_line]$ intervals among proposed patches.
2. **Parallel Meta-Synthesis**: Groups conflicting proposals into clusters and merges them concurrently using the `SynthesizerAgent`.
3. **Bottom-to-Top Patch Application**: Applies resolved patches in descending line order ($N \to 1$), eliminating offset drift.
4. **AST Syntax Verification**: Executes `ast.parse()` on the synthesized output to guarantee zero syntax regressions before diff generation.

---

## 4. Latency & Performance Engineering

During Phase 2, a complete performance audit was performed, reducing execution latency from **~30s+ down to ~7.0s**:

```
[Phase 1 Sequential]:   |--- Security (4s) ---|--- Perf (4s) ---|--- Refactor (4s) ---|--- Sequential Synthesis (20s) ---|  ~32.0s
[Phase 2 Parallelized]: |-- Security (1s) --|
                        |-- Perf (1s)     --|---> |-- Parallel Synthesis (2s) --|                                           ~7.0s
                        |-- Refactor (1s) --|
```

1. **Concurrent Multi-Agent Execution**:
   - Refactored `workflow.py` to dispatch Security, Performance, and Refactor agents simultaneously via `asyncio.gather`.
2. **Parallel Conflict Synthesis**:
   - Replaced sequential synthesis loops with parallel execution across overlapping clusters in `diff_resolver.py`.
3. **Fast Groq Model Selection**:
   - Switched to active high-throughput models (`qwen/qwen3.8-27b` / `openai/gpt-oss-20b`) delivering **~0.86s** inference times.
4. **Zero-Lag DOM Rendering**:
   - Replaced `scrollIntoView({ behavior: 'smooth' })` with instant `scrollTop = scrollHeight` in `AgentTerminal.tsx`, eliminating animation queue stutter.

---

## 5. Complete Removal of Mock Data

* **Deleted Legacy Files**:
  - `backend/mock_data.py` (deleted)
  - `backend/routers/scans.py` (deleted)
  - `frontend/src/data/mockScans.ts` and `frontend/src/data/` directory (deleted)
* **Real Dynamic State**:
  - All diffs, telemetry logs, agent statuses, and scan histories now originate exclusively from live backend execution and REST endpoints (`/api/scans/*`).

---

## 6. Verification & Benchmark Results

### Automated Pipeline Benchmark:
```
[Supervisor] AST Parser indexed 11 lines (1 functions, 0 classes, 2 imports).
[Supervisor] Dispatched concurrent AST audit across Security, Performance, and Refactor agents in parallel...
[Security Agent] Found 2 security vulnerabilities (SQLi / Command Injection).
[Performance Agent] Identified 1 algorithmic bottleneck.
[Syntax & Refactor Agent] Synthesized 3 clean-code refactorings.
[Supervisor] Reconciling 6 proposed patches across agents...
[Supervisor] Resolved 3 overlapping patch conflicts via LLM meta-synthesis.
[Supervisor] Remediation pipeline completed! 3 patches applied (+3 / -3 lines). AST syntax verified.

[BENCHMARK] Total Pipeline Runtime: 7.03 seconds
[BUILD] Frontend Production Bundle: Built in 4.12s (0 errors)
```

---

## 7. How to Run

### Backend
```bash
cd d:/MAS/backend
pip install -r requirements.txt
python main.py
```
* **API Documentation**: `http://localhost:8000/docs`
* **Telemetry Stream**: `ws://localhost:8000/ws/agent-stream/{scan_id}`

### Frontend
```bash
cd d:/MAS/frontend
npm install
npm run dev
```
* **Dashboard Interface**: `http://localhost:5173`
