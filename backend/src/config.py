import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Force reload from .env in backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"), override=True)

class Settings(BaseModel):
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    use_ollama: bool = os.getenv("USE_OLLAMA", "false").lower() in ("true", "1", "yes")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    temperature: float = float(os.getenv("TEMPERATURE", "0.1"))
    max_tokens: int = int(os.getenv("MAX_TOKENS", "2048"))
    strict_ast_validation: bool = os.getenv("STRICT_AST_VALIDATION", "true").lower() in ("true", "1", "yes")

settings = Settings()

def get_llm(temperature: Optional[float] = None, json_mode: bool = False):
    """Factory creating configured Chat LLM instance (Groq or Ollama) with optional JSON mode."""
    temp = temperature if temperature is not None else settings.temperature
    
    if settings.use_ollama:
        try:
            from langchain_community.chat_models import ChatOllama
            format_mode = "json" if json_mode else None
            return ChatOllama(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                temperature=temp,
                format=format_mode
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize ChatOllama: {e}")
    else:
        # Default to LangChain Groq
        try:
            from langchain_groq import ChatGroq
            api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
            if not api_key:
                print("[WARN] GROQ_API_KEY not found in environment.")
            
            kwargs = {
                "api_key": api_key,
                "model_name": settings.groq_model,
                "temperature": temp,
                "max_tokens": settings.max_tokens,
            }
            if json_mode:
                kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}
            return ChatGroq(**kwargs)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize ChatGroq: {e}")
