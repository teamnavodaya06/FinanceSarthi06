import React, { useState, useEffect } from 'react';
import { Income, CreateIncomeDto } from '@financesarthi/types';
import { incomeApi } from '../api/incomeApi';
import { X, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  validateMonthlyIncome,
  validateEmploymentType,
  validateSalaryType,
  validateIncomeFrequency,
  validateCityCategory,
  validateRiskProfile,
  validateTaxRegime,
  validateCurrency,
  validateGoals,
  validateNotes,
  validateAdditionalIncomeSource,
  validateIncomePayload,
} from '@financesarthi/utils';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncome: Income | null;
  onSaveSuccess: (updated: Income) => void;
}

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  onClose,
  currentIncome,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<CreateIncomeDto>>({
    monthlyIncome: 75000,
    salaryType: 'Salary',
    employmentType: 'Private',
    incomeFrequency: 'Monthly',
    cityCategory: 'Tier2',
    taxRegime: 'New',
    bonusIncome: 0,
    otherIncome: 0,
    freelanceIncome: 0,
    rentalIncome: 0,
    investmentIncome: 0,
    riskProfile: 'Balanced',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Real-time Validation States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentIncome) {
      const initialData = {
        monthlyIncome: currentIncome.monthlyIncome,
        salaryType: currentIncome.salaryType,
        employmentType: currentIncome.employmentType,
        incomeFrequency: currentIncome.incomeFrequency,
        cityCategory: currentIncome.cityCategory,
        taxRegime: currentIncome.taxRegime,
        bonusIncome: currentIncome.bonusIncome,
        otherIncome: currentIncome.otherIncome,
        freelanceIncome: currentIncome.freelanceIncome,
        rentalIncome: currentIncome.rentalIncome,
        investmentIncome: currentIncome.investmentIncome,
        riskProfile: currentIncome.riskProfile,
        notes: currentIncome.notes || '',
      };
      setFormData(initialData);
      
      // Run pre-validation silently (untouched)
      const check = validateIncomePayload({
        ...initialData,
        currency: 'INR',
        financialPriority: currentIncome.financialPriority,
        isPrimaryIncome: true,
      });
      const errorsObj: Record<string, string> = {};
      check.errors.forEach(err => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
    }
    setTouchedFields({});
  }, [currentIncome, isOpen]);

  if (!isOpen) return null;

  const runFieldValidation = (name: string, value: any) => {
    let error: string | null = null;
    switch (name) {
      case 'monthlyIncome':
        error = validateMonthlyIncome(value);
        break;
      case 'employmentType':
        error = validateEmploymentType(value);
        break;
      case 'salaryType':
        error = validateSalaryType(value);
        break;
      case 'incomeFrequency':
        error = validateIncomeFrequency(value);
        break;
      case 'cityCategory':
        error = validateCityCategory(value);
        break;
      case 'riskProfile':
        error = validateRiskProfile(value);
        break;
      case 'taxRegime':
        error = validateTaxRegime(value);
        break;
      case 'bonusIncome':
        error = validateAdditionalIncomeSource(value, 'Bonus income');
        break;
      case 'freelanceIncome':
        error = validateAdditionalIncomeSource(value, 'Freelance income');
        break;
      case 'rentalIncome':
        error = validateAdditionalIncomeSource(value, 'Rental income');
        break;
      case 'investmentIncome':
        error = validateAdditionalIncomeSource(value, 'Investment income');
        break;
      case 'otherIncome':
        error = validateAdditionalIncomeSource(value, 'Other income');
        break;
      case 'notes':
        error = validateNotes(value);
        break;
      default:
        break;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // For numeric inputs, we let the user type but validate as number
    const castedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: castedValue };
      runFieldValidation(name, castedValue);
      return updated;
    });
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    runFieldValidation(name, formData[name as keyof CreateIncomeDto]);
  };

  const getInputBorderClass = (name: string) => {
    const isTouched = touchedFields[name];
    const hasError = fieldErrors[name];
    if (isTouched) {
      if (hasError) {
        return 'border-red-500 focus:border-red-500 bg-red-500/5 dark:bg-red-950/10';
      } else {
        return 'border-emerald-500 focus:border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10';
      }
    }
    return 'border-slate-200 dark:border-slate-800 focus:border-blue-500';
  };

  const renderValidationStatusIcon = (name: string) => {
    const isTouched = touchedFields[name];
    const hasError = fieldErrors[name];
    if (!isTouched) return null;
    return (
      <div className="absolute right-3.5 top-3 flex items-center pointer-events-none">
        {hasError ? (
          <AlertCircle className="h-4.5 w-4.5 text-red-500" />
        ) : (
          <Check className="h-4.5 w-4.5 text-emerald-500" />
        )}
      </div>
    );
  };

  const renderFieldErrorMessage = (name: string) => {
    const isTouched = touchedFields[name];
    const hasError = fieldErrors[name];
    if (isTouched && hasError) {
      return (
        <span className="text-[10px] text-red-500 font-bold block mt-1 transition-all">
          {hasError}
        </span>
      );
    }
    return null;
  };

  // Button disabled state
  const hasValidationErrors = Object.keys(fieldErrors).length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Force validation on all fields before submission
    const check = validateIncomePayload({
      ...formData,
      currency: 'INR',
      financialPriority: currentIncome?.financialPriority || ['Wealth Creation'],
      isPrimaryIncome: true,
    });

    if (!check.success) {
      const errorsObj: Record<string, string> = {};
      check.errors.forEach(err => {
        errorsObj[err.field] = err.message;
      });
      setFieldErrors(errorsObj);
      setTouchedFields(
        Object.keys(formData).reduce((acc, curr) => ({ ...acc, [curr]: true }), {})
      );
      setErrorMsg('Validation failed. Please correct the highlighted errors before saving.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setValidationErrors([]);

    try {
      const payload: CreateIncomeDto = {
        monthlyIncome: Number(formData.monthlyIncome) || 0,
        salaryType: formData.salaryType || 'Salary',
        employmentType: formData.employmentType || 'Private',
        incomeFrequency: formData.incomeFrequency || 'Monthly',
        cityCategory: formData.cityCategory || 'Tier2',
        taxRegime: formData.taxRegime || 'New',
        bonusIncome: Number(formData.bonusIncome) || 0,
        otherIncome: Number(formData.otherIncome) || 0,
        freelanceIncome: Number(formData.freelanceIncome) || 0,
        rentalIncome: Number(formData.rentalIncome) || 0,
        investmentIncome: Number(formData.investmentIncome) || 0,
        riskProfile: formData.riskProfile || 'Balanced',
        notes: formData.notes || '',
        currency: 'INR',
        financialPriority: currentIncome?.financialPriority || ['Wealth Creation'],
        isPrimaryIncome: true,
      };

      let response;
      if (currentIncome) {
        response = await incomeApi.updateIncome(currentIncome.id, payload);
      } else {
        response = await incomeApi.createIncome(payload);
      }

      if (response.success && response.data) {
        onSaveSuccess(response.data);
        onClose();
      } else {
        setErrorMsg(response.message || 'Operation failed');
        setValidationErrors(response.errors || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-900 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentIncome ? 'Edit Income Profile' : 'Configure Income Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Error Callouts */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              <p>{errorMsg}</p>
              {validationErrors.length > 0 && (
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Form validation summary */}
          {hasValidationErrors && Object.keys(touchedFields).length > 0 && (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-bold">
              <p className="uppercase tracking-wide mb-1 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Please resolve validation errors:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {Object.keys(fieldErrors).map((f) => (
                  <li key={f}>{fieldErrors[f]}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Row 1: Monthly base income & Salary type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Monthly Take-Home Salary (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="monthlyIncome"
                  required
                  value={formData.monthlyIncome ?? ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur('monthlyIncome')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('monthlyIncome')}`}
                />
                {renderValidationStatusIcon('monthlyIncome')}
              </div>
              {renderFieldErrorMessage('monthlyIncome')}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Salary Type
              </label>
              <div className="relative">
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  onBlur={() => handleBlur('salaryType')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('salaryType')}`}
                >
                  {['Salary', 'Business', 'Freelancer', 'Mixed'].map((t) => (
                    <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                  ))}
                </select>
                {renderValidationStatusIcon('salaryType')}
              </div>
              {renderFieldErrorMessage('salaryType')}
            </div>
          </div>

          {/* Row 2: Employment details & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Employment Type
              </label>
              <div className="relative">
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  onBlur={() => handleBlur('employmentType')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('employmentType')}`}
                >
                  {['Private', 'Government', 'Self Employed', 'Business Owner', 'Freelancer', 'Student', 'Retired'].map((t) => (
                    <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                  ))}
                </select>
                {renderValidationStatusIcon('employmentType')}
              </div>
              {renderFieldErrorMessage('employmentType')}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Income Frequency
              </label>
              <div className="relative">
                <select
                  name="incomeFrequency"
                  value={formData.incomeFrequency}
                  onChange={handleChange}
                  onBlur={() => handleBlur('incomeFrequency')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('incomeFrequency')}`}
                >
                  {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((t) => (
                    <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                  ))}
                </select>
                {renderValidationStatusIcon('incomeFrequency')}
              </div>
              {renderFieldErrorMessage('incomeFrequency')}
            </div>
          </div>

          {/* Row 3: City category & Tax Regime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                City Category
              </label>
              <div className="relative">
                <select
                  name="cityCategory"
                  value={formData.cityCategory}
                  onChange={handleChange}
                  onBlur={() => handleBlur('cityCategory')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('cityCategory')}`}
                >
                  {['Metro', 'Tier1', 'Tier2', 'Tier3', 'Rural'].map((t) => (
                    <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                  ))}
                </select>
                {renderValidationStatusIcon('cityCategory')}
              </div>
              {renderFieldErrorMessage('cityCategory')}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tax Regime
              </label>
              <div className="relative">
                <select
                  name="taxRegime"
                  value={formData.taxRegime}
                  onChange={handleChange}
                  onBlur={() => handleBlur('taxRegime')}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('taxRegime')}`}
                >
                  {['Old', 'New'].map((t) => (
                    <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                  ))}
                </select>
                {renderValidationStatusIcon('taxRegime')}
              </div>
              {renderFieldErrorMessage('taxRegime')}
            </div>
          </div>

          {/* Row 4: Risk Profile */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Investment Risk Profile
            </label>
            <div className="relative">
              <select
                name="riskProfile"
                value={formData.riskProfile}
                onChange={handleChange}
                onBlur={() => handleBlur('riskProfile')}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all ${getInputBorderClass('riskProfile')}`}
              >
                {['Conservative', 'Balanced', 'Aggressive'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
              {renderValidationStatusIcon('riskProfile')}
            </div>
            {renderFieldErrorMessage('riskProfile')}
          </div>

          {/* Section: Additional Sources of Revenue */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Additional Monthly Revenue Sources (₹)
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Bonus / Incentives', name: 'bonusIncome' },
                { label: 'Freelance revenue', name: 'freelanceIncome' },
                { label: 'Rental receipts', name: 'rentalIncome' },
                { label: 'Investments yields', name: 'investmentIncome' },
                { label: 'Other receipts', name: 'otherIncome' },
              ].map((src) => (
                <div key={src.name} className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block">
                    {src.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name={src.name}
                      value={formData[src.name as keyof CreateIncomeDto] ?? ''}
                      onChange={handleChange}
                      onBlur={() => handleBlur(src.name)}
                      className={`w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-bold text-xs focus:outline-none transition-all ${getInputBorderClass(src.name)}`}
                    />
                    {renderValidationStatusIcon(src.name)}
                  </div>
                  {renderFieldErrorMessage(src.name)}
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Notes */}
          <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-900">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Additional Notes
            </label>
            <div className="relative">
              <textarea
                name="notes"
                rows={2}
                value={formData.notes ?? ''}
                onChange={handleChange}
                onBlur={() => handleBlur('notes')}
                placeholder="Provide details about your sources of income..."
                className={`w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border text-slate-900 dark:text-white font-medium text-xs focus:outline-none transition-all ${getInputBorderClass('notes')}`}
              />
              {renderValidationStatusIcon('notes')}
            </div>
            {renderFieldErrorMessage('notes')}
          </div>

        </form>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || hasValidationErrors}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 disabled:text-white/60 text-white text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Generate My AI Financial Blueprint</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
