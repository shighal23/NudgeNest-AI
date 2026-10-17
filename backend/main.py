from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="NudgeNest AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen2.5:3b"


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {"message": "NudgeNest AI backend is running!"}


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get("http://localhost:11434/api/tags")
            response.raise_for_status()
            models = response.json().get("models", [])
            available = any(
                model.get("name", "").startswith(MODEL_NAME)
                for model in models
            )
        return {"backend": "ok", "ollama": "connected" if available else "model_not_found"}
    except Exception:
        return {"backend": "ok", "ollama": "not_connected"}


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are NudgeNest AI, a friendly personal "
                                "productivity assistant. Help with daily planning, "
                                "study schedules, tasks, and organizing life. "
                                "Be clear, practical, and concise."
                            ),
                        },
                        {"role": "user", "content": request.message},
                    ],
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()

        return {"reply": data["message"]["content"]}

    except httpx.ConnectError:
        return {
            "reply": "I couldn't connect to Ollama. Please make sure Ollama is running."
        }
    except httpx.HTTPStatusError as error:
        return {
            "reply": f"Ollama returned an error: {error.response.status_code}. Check that qwen2.5:3b is installed."
        }
    except Exception as error:
        return {"reply": f"Something went wrong: {str(error)}"}
