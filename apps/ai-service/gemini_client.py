import os
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai_service")

# NVIDIA & Voice Agent API Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", os.getenv("VOICE_AGENT_API_KEY", "sk_8d9ab48948dc666fc108565ecfb3d16c2db71bc2139aee4e"))
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-voicechat")


# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

nvidia_client = None
try:
    if NVIDIA_API_KEY:
        from openai import OpenAI
        nvidia_client = OpenAI(base_url=NVIDIA_BASE_URL, api_key=NVIDIA_API_KEY)
except Exception as e:
    logger.warning(f"Failed to initialize OpenAI SDK for NVIDIA: {e}")

gemini_model = None
try:
    if GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
except Exception as e:
    logger.warning(f"Failed to initialize Gemini SDK: {e}")


SARTHI_VOICE_SYSTEM_PROMPT = """You are Sarthi, the intelligent, calm, helpful realtime voice assistant for FinanceSarthi (India's Smartest AI Financial Companion).

Primary Purpose:
- Help users understand and navigate their finances on the FinanceSarthi platform.
- Explain salary planning (50/30/20 budget allocations), expense tracking, emergency safety funds, tax savings (80C, 80D, Old vs New Regime), SIP investments, adaptive budgets, and net worth overview.

Multilingual Persona Rules:
- Automatically detect the user's spoken language (Hindi, Hinglish, English, Tamil, Telugu, Gujarati, Bengali, Marathi, Spanish, French, Arabic, etc.).
- Respond naturally in the SAME language/dialect the user speaks. If the user uses Hinglish, respond in natural Hinglish.
- If the user switches language, switch your response language accordingly. Never ask "What language would you like?".

Voice Constraints:
- Keep voice answers short, clear, and conversational (1 to 3 sentences maximum).
- Avoid long bullet points or raw markdown formatting like asterisks or hashtags.
- Do not invent false information about the website.
- Do not expose internal APIs, models, backend architecture, or API keys.
"""

def generate_voice_response(prompt: str, context: Dict[str, Any]) -> str:
    """
    Generate realtime voice response for Sarthi Voice Agent using NVIDIA Nemotron VoiceChat.
    """
    messages = [
        {"role": "system", "content": SARTHI_VOICE_SYSTEM_PROMPT},
        {"role": "user", "content": f"Context: {context}\nUser Voice Query: {prompt}"}
    ]

    if nvidia_client and NVIDIA_API_KEY:
        try:
            completion = nvidia_client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=messages,
                temperature=0.7,
                top_p=0.95,
                max_tokens=512,
            )
            choice = completion.choices[0]
            content = choice.message.content or ""
            if content.strip():
                return content.strip()
        except Exception as e:
            logger.error(f"NVIDIA Nemotron VoiceChat API error: {e}")

    if gemini_model and GEMINI_API_KEY:
        try:
            full_p = f"{SARTHI_VOICE_SYSTEM_PROMPT}\n\nContext: {context}\nUser Voice Query: {prompt}"
            response = gemini_model.generate_content(full_p)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini voice fallback failed: {e}")

    return fallback_voice_advisor(prompt, context)


def generate_chat_response(prompt: str, context: Dict[str, Any], history: List[Dict[str, str]] = None) -> str:
    """
    Generate conversational AI response using NVIDIA Nemotron API, Gemini API, or rule-based fallback engine.
    """
    full_prompt = f"User Profile Context: {context}\n\nUser Question: {prompt}"

    # Priority 1: NVIDIA Nemotron API via OpenAI Client
    if nvidia_client and NVIDIA_API_KEY:
        try:
            completion = nvidia_client.chat.completions.create(
                model=NVIDIA_MODEL,
                messages=[
                    {"role": "system", "content": SARTHI_VOICE_SYSTEM_PROMPT},
                    {"role": "user", "content": full_prompt}
                ],
                temperature=0.7,
                top_p=0.95,
                max_tokens=4096,
            )

            full_text = ""
            reasoning_text = ""

            for chunk in completion:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                reasoning = getattr(delta, "reasoning_content", None)
                if reasoning:
                    reasoning_text += reasoning
                if delta.content is not None:
                    full_text += delta.content

            res_output = full_text if full_text.strip() else reasoning_text
            if res_output and res_output.strip():
                return res_output.strip()
        except Exception as e:
            logger.error(f"NVIDIA API call failed: {e}. Attempting Gemini fallback...")

    # Priority 2: Gemini API Fallback
    if gemini_model and GEMINI_API_KEY:
        try:
            response = gemini_model.generate_content(full_prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")

    # Priority 3: High-quality contextual fallback rule engine
    return fallback_sarthi_advisor(prompt, context)



def fallback_sarthi_advisor(prompt: str, context: Dict[str, Any]) -> str:
    """
    Rule-based intelligent financial advisor response generator.
    """
    lower_prompt = prompt.lower()
    income = context.get("monthlyIncome", 75000)
    city_tier = context.get("cityTier", "TIER_2")

    if "tax" in lower_prompt or "80c" in lower_prompt or "regime" in lower_prompt:
        return f"""### 📊 FinanceSarthi Tax Optimization Analysis

Based on your monthly income of **₹{income:,}** ({city_tier}):

1. **New Tax Regime**: Best choice if you prefer simplicity without maintaining investment proofs. Standard deduction is now **₹75,000**.
2. **Old Tax Regime**: Superior if you utilize full **₹1.5L in Section 80C** (ELSS Mutual Funds/PPF/EPF), **₹50,000 in Section 80CCD(1B) NPS**, **₹25,000 in 80D Health Insurance**, and claim HRA.

💡 **Actionable Tip**: If total deductions exceed ₹3.75 Lakhs annually, the **Old Regime** will save you more tax; otherwise, stick to the **New Regime**!"""

    if "sip" in lower_prompt or "invest" in lower_prompt or "mutual fund" in lower_prompt:
        monthly_savings = int(income * 0.20)
        return f"""### 🚀 Wealth Acceleration Guide (SIP Strategy)

With your current monthly income of **₹{income:,}**, we recommend allocating **₹{monthly_savings:,} (20%)** towards automated monthly SIPs:

- **Nifty 50 Index Fund (Large Cap)**: ₹{int(monthly_savings * 0.50):,} (50% allocation for core stability)
- **Flexi-Cap / Mid-Cap Fund**: ₹{int(monthly_savings * 0.30):,} (30% allocation for high growth)
- **Small-Cap or Sectoral Fund**: ₹{int(monthly_savings * 0.20):,} (20% allocation for alpha generation)

📈 **10-Year Growth Projection**: An automated ₹{monthly_savings:,}/month SIP at 12% CAGR will build a wealth corpus of approximately **₹1.75 Crores** in 15 years!"""

    if "emergency" in lower_prompt or "safety" in lower_prompt:
        ef_target = income * 6
        return f"""### 🛡️ Emergency Fund Strategy

For a **{city_tier}** earner with ₹{income:,} income:
- **Recommended Coverage**: 6 Months of Living Expenses = **₹{ef_target:,}**
- **Allocation Rule**:
  - 50% in a High-Yield Liquid Mutual Fund or Savings Account (Instant Liquidity)
  - 50% in Short-Term Arbitrage or FD Sweep-in facility

🔒 *Never invest emergency funds in equity market instruments!*"""

    return f"""### 💡 FinanceSarthi Insights for Your Financial Profile

Hello! Based on your **{city_tier}** earner profile (Monthly Income: ₹{income:,}):

1. **Budget Allocation (50-30-20 Rule)**:
   - Needs (Rent, Utilities, Food): ₹{int(income * 0.50):,}
   - Wants (Dining, Shopping): ₹{int(income * 0.30):,}
   - Savings & SIP Investments: ₹{int(income * 0.20):,}

2. **Next Best Step**: Ensure you have an active 6-month Emergency Fund and clear any high-interest debt before scaling up equity investments.

How else can I assist you with your tax planning, goal tracking, or SIP calculations?"""


def fallback_voice_advisor(prompt: str, context: Dict[str, Any]) -> str:
    """
    Multilingual fallback voice advisor for Sarthi Voice Agent.
    """
    lower = prompt.lower()
    income = context.get("monthlyIncome", 75000)

    # Detect Hindi / Hinglish
    if any(w in lower for w in ["mera", "batao", "kaise", "hoga", "karna", "kharch", "bachat", "bachao", "hai", "kya"]):
        if "tax" in lower or "save" in lower or "80c" in lower:
            return f"Aap New Tax Regime ke under 7 Lakh tak tax-free income enjoy kar sakte ho. Agar aapke deductions 3.75 Lakh se zyada hain, to Old Regime choose kijiye."
        if "sip" in lower or "invest" in lower or "fund" in lower:
            return f"Aapke ₹{income:,.0f} monthly income ke hisab se 20% yani ₹{round(income * 0.2):,} har mahine Nifty Index fund aur Flexi Cap SIP mein invest karna best rahega."
        return f"Namaste! Mai Sarthi hu. Aapka budget aur financial health score safe zone mein hai. Mai aapke tax, SIPs ya goals mein madad kar sakta hu."

    # Default English Voice Response
    if "tax" in lower or "save" in lower:
        return f"Under the New Tax Regime, income up to 7 Lakh Rupees is tax-exempt. Check our Salary and Tax Planner tab for customized savings."
    if "sip" in lower or "invest" in lower:
        return f"I recommend allocating 20% of your salary, around {round(income * 0.2):,} Rupees per month, into diversified equity index funds."
    return f"Hello! I am Sarthi, your AI financial guide for FinanceSarthi. How can I help optimize your money goals today?"
