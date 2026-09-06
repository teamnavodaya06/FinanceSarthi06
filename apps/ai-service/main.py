import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from financial_engine import compute_financial_health
from gemini_client import generate_chat_response

app = FastAPI(
    title="FinanceSarthi AI Microservice",
    version="1.0.0",
    description="Python FastAPI service for Financial Health Engine, Gemini Prompting, and Rule Engine"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthScoreRequest(BaseModel):
    monthlyIncome: float = Field(..., example=75000)
    monthlySavings: float = Field(..., example=15000)
    monthlyDebtEmi: float = Field(default=0, example=10000)
    emergencyFundMonths: float = Field(default=3, example=4)
    hasInsurance: bool = Field(default=True)


class BudgetRequest(BaseModel):
    monthlyIncome: float
    cityTier: str = "TIER_2"
    expenses: Optional[float] = 0
    debtEmi: Optional[float] = 0


class ChatRequest(BaseModel):
    prompt: str
    context: Dict[str, Any] = {}
    history: Optional[List[Dict[str, str]]] = []


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FinanceSarthi AI Microservice",
        "version": "1.0.0",
        "nvidia_active": bool(os.getenv("NVIDIA_API_KEY")),
        "gemini_active": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/ai/health-score")
def get_health_score(req: HealthScoreRequest):
    return compute_financial_health(
        req.monthlyIncome,
        req.monthlySavings,
        req.monthlyDebtEmi,
        req.emergencyFundMonths,
        req.hasInsurance
    )


@app.post("/ai/budget-recommendation")
def get_budget_recommendation(req: BudgetRequest):
    inc = req.monthlyIncome
    tier = req.cityTier.upper()

    needs_pct, wants_pct, savings_pct = 50, 30, 20
    if tier == "TIER_1":
        needs_pct, wants_pct, savings_pct = 55, 25, 20
    elif tier == "TIER_3":
        needs_pct, wants_pct, savings_pct = 40, 30, 30

    return {
        "monthlyIncome": inc,
        "cityTier": tier,
        "recommendation": {
            "needs": {"amount": round(inc * (needs_pct / 100)), "percentage": needs_pct},
            "wants": {"amount": round(inc * (wants_pct / 100)), "percentage": wants_pct},
            "savings": {"amount": round(inc * (savings_pct / 100)), "percentage": savings_pct},
        },
        "tips": [
            f"As a {tier} resident, keep rent and core living costs under {needs_pct}%.",
            f"Automate ₹{round(inc * (savings_pct / 100)):,} SIP on the 1st of every month."
        ]
    }


@app.post("/ai/chat")
def chat_with_sarthi(req: ChatRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    reply = generate_chat_response(req.prompt, req.context, req.history)
    return {
        "sender": "sarthi",
        "text": reply,
        "suggestions": [
            "How do I save more tax under New Regime?",
            "What is the best mutual fund split for my income?",
            "How much emergency fund do I need in Tier 2 cities?"
        ]
    }


@app.post("/ai/voice")
def voice_agent_sarthi(req: ChatRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Voice prompt cannot be empty.")
    
    voice_reply = generate_voice_response(req.prompt, req.context)
    return {
        "sender": "sarthi_voice",
        "text": voice_reply,
        "status": "success"
    }
