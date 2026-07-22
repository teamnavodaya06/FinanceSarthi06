from typing import Dict, Any, List

def compute_financial_health(income: float, savings: float, debt_emi: float, ef_months: float, has_insurance: bool) -> Dict[str, Any]:
    """
    Python rule engine to calculate financial health score (0-1000)
    """
    if income <= 0:
        return {"score": 500, "grade": "FAIR", "insights": ["Please update your income profile."]}

    savings_ratio = (savings / income) * 100
    savings_score = min(300, int((savings_ratio / 30) * 300))

    dti_ratio = (debt_emi / income) * 100
    dti_score = 250 if dti_ratio <= 30 else max(0, int(250 - (dti_ratio - 30) * 5))

    ef_score = min(250, int((ef_months / 6) * 250))
    insurance_score = 200 if has_insurance else 50

    total_score = savings_score + dti_score + ef_score + insurance_score

    grade = "POOR"
    if total_score >= 850:
        grade = "ELITE"
    elif total_score >= 750:
        grade = "EXCELLENT"
    elif total_score >= 650:
        grade = "GOOD"
    elif total_score >= 500:
        grade = "FAIR"

    insights = []
    if savings_ratio < 20:
        insights.append("Your monthly savings ratio is below 20%. Aim for 20-30% allocation to automated SIPs.")
    if dti_ratio > 35:
        insights.append("Your debt EMI obligations exceed 35% of income. Focus on paying down high-cost credit cards/loans.")
    if ef_months < 6:
        insights.append(f"Your emergency fund covers {ef_months} months. Build a 6-month safety net in liquid funds.")
    if not has_insurance:
        insights.append("Ensure you hold adequate term life and health insurance protection.")

    return {
        "score": total_score,
        "grade": grade,
        "savings_score": savings_score,
        "dti_score": dti_score,
        "ef_score": ef_score,
        "insurance_score": insurance_score,
        "insights": insights
    }
