# Autonomous Multi-Agent Code Remediation Engine

Real, production-grade autonomous multi-agent code analysis and AST remediation engine.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Monaco Diff Editor (`@monaco-editor/react`), Lucide Icons.
- **Design System**: Linear/Vercel-inspired matte dark mode (zinc/slate), sharp borders, high-contrast monochrome accents, Inter/Geist typography, JetBrains Mono code rendering.
- **Backend**: FastAPI, WebSockets for real-time telemetry streaming, Pydantic v2 schemas.
- **AST Engine**: Tree-sitter & Python AST parser extracting scopes, byte offsets, and dependency call-graphs.
- **Agent Framework**: LangGraph StateGraph, LangChain Core, LangChain-Groq (`qwen/qwen3.8-27b` / `openai/gpt-oss-20b` / Ollama).
- **Conflict Resolution**: Algorithmic line-range cluster detection, parallel LLM meta-synthesis, bottom-to-top patch application, and AST syntax validation.

---

## 📁 Repository Structure

```
d:/MAS/
├── backend/
│   ├── main.py                  # FastAPI server with CORS & WebSocket routing
│   ├── requirements.txt         # Production dependencies
│   ├── .env                     # LLM Provider Configuration (Groq / Ollama)
│   └── src/
│       ├── config.py            # Settings and Chat LLM Factory
│       ├── parser/
│       │   └── ast_parser.py    # Tree-sitter & AST scope/hierarchy parser
│       ├── models/
│       │   └── state.py         # Pydantic v2 & LangGraph state definitions
│       ├── agents/
│       │   ├── base_agent.py    # Base agent with AST context injection
│       │   ├── security_agent.py# Security Agent (SQLi, Command Inj, Deserialization)
│       │   ├── performance_agent.py # Performance Agent (O(N^2), I/O in loops)
│       │   ├── maintainability_agent.py # Refactoring Agent (Complexity, typing)
│       │   ├── supervisor.py    # Supervisor Orchestrator
│       │   └── synthesizer.py   # Meta-Synthesizer for overlapping patch conflicts
│       ├── engine/
│       │   ├── diff_resolver.py # Algorithmic diff merger & conflict clusterer
│       │   └── workflow.py      # LangGraph parallel execution engine
│       └── api/
│           ├── routes.py        # REST endpoints (AST parsing, direct code, file upload)
│           └── ws_handler.py    # WebSocket live telemetry and diff broadcaster
│
├── frontend/
│   ├── package.json             # Node dependencies
│   ├── vite.config.ts           # Vite reverse proxy configuration
│   ├── tailwind.config.js       # Matte zinc theme & JetBrains typography
│   └── src/
│       ├── types/               # TypeScript domain models
│       ├── hooks/
│       │   └── useAgentStream.ts# Real WebSocket stream hook
│       ├── components/
│       │   ├── layout/          # Header & Sidebar
│       │   ├── dashboard/       # Agent Status Topology Panel
│       │   ├── diff-viewer/     # Monaco Split-Pane Diff Editor & Rationale Bar
│       │   ├── terminal/        # Live Agent CLI Terminal
│       │   └── ui/              # Badges, Buttons, Cards
│       ├── App.tsx              # Master dashboard composition
│       └── main.tsx             # React entrypoint
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend Daemon

```bash
cd d:/MAS/backend
pip install -r requirements.txt
python main.py
```

* API Docs: `http://localhost:8000/docs`
* Telemetry WebSocket: `ws://localhost:8000/ws/agent-stream/{scan_id}`

### 2. Start the Frontend Dashboard

```bash
cd d:/MAS/frontend
npm run dev
```

* Dashboard UI: `http://localhost:5173`
