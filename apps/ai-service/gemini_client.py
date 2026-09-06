import os
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai_service")

# NVIDIA API Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "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")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "moonshotai/kimi-k3")

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
                messages=[{"role": "user", "content": full_prompt}],
                temperature=0.7,
                top_p=0.95,
                max_tokens=4096,
                extra_body={"chat_template_kwargs": {"enable_thinking": True}},
                stream=True
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
