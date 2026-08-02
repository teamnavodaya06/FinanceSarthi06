import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { validateExpensePayload, sanitizeInput } from '@financesarthi/utils';

export function validateExpenseBody(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.body) {
    if (typeof req.body.title === 'string') {
      req.body.title = sanitizeInput(req.body.title);
    }
    if (typeof req.body.merchant === 'string') {
      req.body.merchant = sanitizeInput(req.body.merchant);
    }
    if (typeof req.body.notes === 'string') {
      req.body.notes = sanitizeInput(req.body.notes);
    }
    
    // Cast numeric fields safely
    if (req.body.amount !== undefined && req.body.amount !== null && req.body.amount !== '') {
      const numVal = Number(req.body.amount);
      if (isNaN(numVal) || !isFinite(numVal)) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ field: 'amount', message: 'Expense amount must be a valid number.' }],
          timestamp: new Date().toISOString()
        });
      }
      req.body.amount = numVal;
    }
  }

  // Pre-fill payment method if not supplied to ensure default compatibility
  if (req.body.paymentMethod === undefined) {
    req.body.paymentMethod = 'UPI';
  }

  // Pre-fill date to today if not supplied
  if (req.body.date === undefined) {
    req.body.date = new Date().toISOString().split('T')[0];
  }

  // For PATCH requests, ignore missing fields by replacing them with dummy defaults if they are not supplied
  const payloadToValidate = {
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    subcategory: req.body.subcategory ?? '',
    paymentMethod: req.body.paymentMethod,
    date: req.body.date,
    merchant: req.body.merchant ?? '',
    tags: req.body.tags ?? [],
    isRecurring: req.body.isRecurring ?? false,
    recurrenceFrequency: req.body.recurrenceFrequency ?? 'Monthly',
  };

  if (req.method === 'PATCH') {
    const dummyDefaults: any = {
      title: 'Valid Expense',
      amount: 100,
      category: 'FOOD',
      paymentMethod: 'UPI',
      date: new Date().toISOString().split('T')[0],
    };
    for (const key of Object.keys(dummyDefaults)) {
      if (req.body[key] === undefined) {
        (payloadToValidate as any)[key] = dummyDefaults[key];
      }
    }
  }

  const check = validateExpensePayload(payloadToValidate);
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
