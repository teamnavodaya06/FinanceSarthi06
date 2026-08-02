import React, { useState, useEffect } from 'react';
import { Income, CreateIncomeDto } from '@financesarthi/types';
import { incomeApi } from '../api/incomeApi';
import { X, Sparkles, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (currentIncome) {
      setFormData({
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
      });
    }
  }, [currentIncome, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Math.max(0, Number(value) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Update existing via PATCH
        response = await incomeApi.updateIncome(currentIncome.id, payload);
      } else {
        // Create new via POST
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

          {/* Row 1: Monthly base income & Salary type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Monthly Take-Home Salary (₹)
              </label>
              <input
                type="number"
                name="monthlyIncome"
                required
                min="0"
                value={formData.monthlyIncome}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Salary Type
              </label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              >
                {['Salary', 'Business', 'Freelancer', 'Student', 'Retired'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Employment details & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              >
                {['Private', 'Government', 'Self Employed', 'Business Owner', 'Contract', 'Other'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Income Frequency
              </label>
              <select
                name="incomeFrequency"
                value={formData.incomeFrequency}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              >
                {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: City category & Tax Regime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                City Category
              </label>
              <select
                name="cityCategory"
                value={formData.cityCategory}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              >
                {['Metro', 'Tier1', 'Tier2', 'Tier3', 'Rural'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tax Regime
              </label>
              <select
                name="taxRegime"
                value={formData.taxRegime}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
              >
                {['Old', 'New'].map((t) => (
                  <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Risk Profile */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Investment Risk Profile
            </label>
            <select
              name="riskProfile"
              value={formData.riskProfile}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              {['Conservative', 'Balanced', 'Aggressive'].map((t) => (
                <option key={t} value={t} className="dark:bg-[#0B1426]">{t}</option>
              ))}
            </select>
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
                  <input
                    type="number"
                    name={src.name}
                    min="0"
                    value={formData[src.name as keyof CreateIncomeDto] as number}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Notes */}
          <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-900">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Provide any additional notes about your sources of income..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:border-blue-500 transition-all"
            />
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
            disabled={loading}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
