import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { validateIncomePayload, sanitizeInput } from '@financesarthi/utils';

export function validateIncomeBody(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. Sanitize text fields to protect against HTML injection, XSS, and dangerous quotes
  if (req.body) {
    if (typeof req.body.notes === 'string') {
      req.body.notes = sanitizeInput(req.body.notes);
    }
    if (typeof req.body.currency === 'string') {
      req.body.currency = sanitizeInput(req.body.currency);
    }
    
    // Cast numeric fields safely (Zerodha/CRED style parser integrity checks)
    const numericFields = ['monthlyIncome', 'bonusIncome', 'freelanceIncome', 'rentalIncome', 'investmentIncome', 'otherIncome'];
    for (const f of numericFields) {
      if (req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== '') {
        const numVal = Number(req.body[f]);
        if (isNaN(numVal) || !isFinite(numVal)) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: [{ field: f, message: `${f} must be a valid finite number and cannot contain symbols.` }],
            timestamp: new Date().toISOString()
          });
        }
        req.body[f] = numVal;
      }
    }
  }

  // 2. Perform validation payload validation
  // For PATCH requests, we validate merged fields since it's a partial update
  // However, validation payload matches the payload directly for POST/PUT.
  const payloadToValidate = {
    monthlyIncome: req.body.monthlyIncome,
    bonusIncome: req.body.bonusIncome ?? 0,
    freelanceIncome: req.body.freelanceIncome ?? 0,
    rentalIncome: req.body.rentalIncome ?? 0,
    investmentIncome: req.body.investmentIncome ?? 0,
    otherIncome: req.body.otherIncome ?? 0,
    employmentType: req.body.employmentType,
    salaryType: req.body.salaryType,
    incomeFrequency: req.body.incomeFrequency,
    cityCategory: req.body.cityCategory,
    riskProfile: req.body.riskProfile,
    taxRegime: req.body.taxRegime,
    currency: req.body.currency ?? 'INR',
    financialPriority: req.body.financialPriority ?? [],
    notes: req.body.notes ?? '',
  };

  // For PATCH requests, ignore missing fields by replacing them with dummy defaults if they are not supplied
  if (req.method === 'PATCH') {
    const dummyDefaults: any = {
      monthlyIncome: 10000,
      employmentType: 'Private',
      salaryType: 'Salary',
      incomeFrequency: 'Monthly',
      cityCategory: 'Tier2',
      riskProfile: 'Balanced',
      taxRegime: 'New',
    };
    for (const key of Object.keys(dummyDefaults)) {
      if (req.body[key] === undefined) {
        (payloadToValidate as any)[key] = dummyDefaults[key];
      }
    }
  }

  const check = validateIncomePayload(payloadToValidate);
  if (!check.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: check.errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
}
