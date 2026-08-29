import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from src.api.routes import router as real_scans_router
from src.api.ws_handler import ws_router as real_ws_router

app = FastAPI(
    title="Autonomous Multi-Agent Code Remediation Engine API",
    description="Production-grade real backend: Tree-sitter AST, LangGraph multi-agent orchestration, Groq/Ollama LLM engine, and live telemetry streaming.",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include real production routes and WebSocket handlers
app.include_router(real_scans_router)
app.include_router(real_ws_router)

@app.get("/health", tags=["Health"])
async def health_check():
    from src.config import settings
    return {
        "status": "healthy",
        "service": "real-multi-agent-remediation-engine",
        "phase": 2,
        "llm_provider": "Ollama" if settings.use_ollama else "Groq",
        "model": settings.ollama_model if settings.use_ollama else settings.groq_model,
        "agents_online": [
            "Supervisor Orchestrator",
            "Security Agent",
            "Performance Agent",
            "Maintainability Agent",
            "Synthesis & Conflict Resolver"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
