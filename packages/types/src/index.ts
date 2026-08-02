export type CityTier = 'METRO' | 'TIER_2' | 'TIER_3' | 'VILLAGE';

export type UserRole = 'USER' | 'ADMIN';

export type OccupationType = 'Student' | 'Salaried' | 'Freelancer' | 'Business';

export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type FinancialGoalType =
  | 'EMERGENCY_FUND'
  | 'TRAVEL'
  | 'HOUSE'
  | 'VEHICLE'
  | 'RETIREMENT'
  | 'INVESTMENT'
  | 'EDUCATION'
  | 'WEDDING';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type ExpenseCategory =
  | 'HOUSING'
  | 'FOOD'
  | 'TRANSPORT'
  | 'UTILITIES'
  | 'ENTERTAINMENT'
  | 'HEALTHCARE'
  | 'SHOPPING'
  | 'INVESTMENT'
  | 'DEBT_EMI'
  | 'OTHERS';

export type GoalCategory =
  | 'EMERGENCY_FUND'
  | 'VEHICLE'
  | 'HOUSE'
  | 'VACATION'
  | 'MARRIAGE'
  | 'EDUCATION'
  | 'RETIREMENT'
  | 'OTHER';

export interface FirestoreUserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  provider: 'google' | 'phone' | 'password';
  occupation: OccupationType;
  cityTier: CityTier;
  monthlySalary: number;
  financialGoals: FinancialGoalType[];
  riskProfile: RiskProfile;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isOnboarded: boolean;
  preferredLanguage: string;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cityTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  monthlyIncome: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface TaxCalculationResult {
  grossAnnual: number;
  taxableIncomeOld: number;
  taxableIncomeNew: number;
  taxAmountOld: number;
  taxAmountNew: number;
  recommendedRegime: 'OLD' | 'NEW';
  taxSaved: number;
  monthlyTakeHomeOld: number;
  monthlyTakeHomeNew: number;
}

export interface BudgetAllocation {
  needs: { amount: number; percentage: number };
  wants: { amount: number; percentage: number };
  savings: { amount: number; percentage: number };
  emergencyFundContribution: number;
}

export interface FinancialHealthScore {
  score: number;
  grade: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT' | 'ELITE';
  savingsRatioScore: number;
  debtToIncomeScore: number;
  emergencyFundScore: number;
  investmentDiversityScore: number;
  insights: string[];
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  merchant?: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  type?: TransactionType;
  currency?: string;
  paymentMethod?: string;
  account?: string;
  date: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isRecurring: boolean;
  recurrenceFrequency?: string;
  status?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyAllocation: number;
  isCompleted: boolean;
  predictedCompletionDate?: string;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  category: 'Bank' | 'Mutual Funds' | 'Stocks' | 'Real Estate' | 'Gold' | 'PF/NPS';
  value: number;
  updatedAt: string;
}

export interface Liability {
  id: string;
  userId: string;
  name: string;
  category: 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Credit Card' | 'Education Loan';
  totalAmount: number;
  remaining: number;
  interestRate: number;
  monthlyEmi: number;
  updatedAt: string;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetDistribution: { category: string; value: number }[];
  liabilityDistribution: { category: string; value: number }[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'sarthi';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type SalaryType = 'Salary' | 'Business' | 'Freelancer' | 'Student' | 'Retired';
export type EmploymentType = 'Private' | 'Government' | 'Self Employed' | 'Business Owner' | 'Contract' | 'Other';
export type IncomeFrequency = 'Monthly' | 'Quarterly' | 'Yearly' | 'Weekly';
export type CityCategory = 'Metro' | 'Tier1' | 'Tier2' | 'Tier3' | 'Rural';
export type TaxRegime = 'Old' | 'New';
export type RiskProfileType = 'Conservative' | 'Balanced' | 'Aggressive';

export interface Income {
  id: string;
  userId: string;
  monthlyIncome: number;
  annualIncome: number;
  salaryType: SalaryType;
  employmentType: EmploymentType;
  incomeFrequency: IncomeFrequency;
  cityCategory: CityCategory;
  taxRegime: TaxRegime;
  bonusIncome: number;
  otherIncome: number;
  freelanceIncome: number;
  rentalIncome: number;
  investmentIncome: number;
  currency: string;
  financialPriority: string[];
  riskProfile: RiskProfileType;
  isPrimaryIncome: boolean;
  notes?: string;
  totalAdditionalIncome: number;
  totalIncome: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateIncomeDto {
  monthlyIncome: number;
  salaryType: SalaryType;
  employmentType: EmploymentType;
  incomeFrequency: IncomeFrequency;
  cityCategory: CityCategory;
  taxRegime: TaxRegime;
  bonusIncome?: number;
  otherIncome?: number;
  freelanceIncome?: number;
  rentalIncome?: number;
  investmentIncome?: number;
  currency?: string;
  financialPriority?: string[];
  riskProfile: RiskProfileType;
  isPrimaryIncome?: boolean;
  notes?: string;
}

export interface UpdateIncomeDto extends Partial<CreateIncomeDto> {}

