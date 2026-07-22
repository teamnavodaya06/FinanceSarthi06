import os
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai_service")

# Check Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

try:
    if GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
    else:
        model = None
except Exception as e:
    logger.warning(f"Failed to initialize Gemini SDK: {e}")
    model = None


def generate_chat_response(prompt: str, context: Dict[str, Any], history: List[Dict[str, str]] = None) -> str:
    """
    Generate conversational AI response using Gemini API or rule-based fallback engine.
    """
    if model and GEMINI_API_KEY:
        try:
            full_prompt = f"User Profile Context: {context}\n\nUser Question: {prompt}"
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")

    # High-quality contextual fallback rule engine
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
