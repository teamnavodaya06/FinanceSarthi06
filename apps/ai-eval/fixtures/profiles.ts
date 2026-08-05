import { Income, Expense, Goal, Asset, Liability, CityTier, RiskProfile, OccupationType } from '@financesarthi/types';

export interface TestUserProfile {
  id: string;
  name: string;
  email: string;
  occupation: OccupationType;
  cityTier: CityTier;
  monthlySalary: number;
  riskProfile: RiskProfile;
  taxRegime: 'Old' | 'New';
  
  income: Partial<Income>;
  expenses: Partial<Expense>[];
  goals: Partial<Goal>[];
  assets: Partial<Asset>[];
  liabilities: Partial<Liability>[];
}

export const TEST_PROFILES: Record<string, TestUserProfile> = {
  student: {
    id: "profile-student",
    name: "Aman Sharma",
    email: "aman.sharma@uni.edu",
    occupation: "Student",
    cityTier: "TIER_3",
    monthlySalary: 12000,
    riskProfile: "AGGRESSIVE",
    taxRegime: "New",
    income: {
      monthlyIncome: 12000,
      salaryType: "Student",
      employmentType: "Other",
      cityCategory: "Tier3",
      taxRegime: "New",
      riskProfile: "Aggressive",
      totalIncome: 12000,
    },
    expenses: [
      { id: "e-stu-1", category: "FOOD", amount: 4500, title: "Hostel Mess & Dining" },
      { id: "e-stu-2", category: "HOUSING", amount: 3500, title: "Shared PG Rent" },
      { id: "e-stu-3", category: "ENTERTAINMENT", amount: 2000, title: "OTT, movies & hangs" },
      { id: "e-stu-4", category: "UTILITIES", amount: 1000, title: "Mobile & internet plans" }
    ],
    goals: [
      { id: "g-stu-1", category: "EDUCATION", title: "Semester Fees", targetAmount: 24000, currentAmount: 8000, targetDate: "2026-12-31", monthlyAllocation: 1500 }
    ],
    assets: [],
    liabilities: []
  },
  
  young_professional: {
    id: "profile-yp",
    name: "Rohan Das",
    email: "rohan.das@fintech.com",
    occupation: "Salaried",
    cityTier: "TIER_2",
    monthlySalary: 75000,
    riskProfile: "MODERATE",
    taxRegime: "New",
    income: {
      monthlyIncome: 75000,
      salaryType: "Salary",
      employmentType: "Private",
      cityCategory: "Tier2",
      taxRegime: "New",
      riskProfile: "Balanced",
      totalIncome: 75000,
    },
    expenses: [
      { id: "e-yp-1", category: "HOUSING", amount: 18000, title: "Apartment Rent", isRecurring: true },
      { id: "e-yp-2", category: "FOOD", amount: 8400, title: "Groceries & Swiggy" },
      { id: "e-yp-3", category: "TRANSPORT", amount: 4500, title: "Petrol & Office Commute" },
      { id: "e-yp-4", category: "UTILITIES", amount: 3500, title: "Electricity & Wi-Fi" },
      { id: "e-yp-5", category: "ENTERTAINMENT", amount: 8000, title: "Weekend Dining & Shopping" }
    ],
    goals: [
      { id: "g-yp-1", category: "EMERGENCY_FUND", title: "6-Month Emergency Safety Fund", targetAmount: 150000, currentAmount: 60000, targetDate: "2026-10-31", monthlyAllocation: 10000 },
      { id: "g-yp-2", category: "VEHICLE", title: "Electric Scooter Downpayment", targetAmount: 80000, currentAmount: 20000, targetDate: "2027-04-30", monthlyAllocation: 5000 }
    ],
    assets: [
      { id: "a-yp-1", name: "EPF Balance", category: "PF/NPS", value: 85000 },
      { id: "a-yp-2", name: "Zerodha Mutual Funds", category: "Mutual Funds", value: 120000 }
    ],
    liabilities: []
  },

  family: {
    id: "profile-family",
    name: "Vikram & Priya Mehta",
    email: "vikram.mehta@corp.in",
    occupation: "Salaried",
    cityTier: "METRO",
    monthlySalary: 140000,
    riskProfile: "CONSERVATIVE",
    taxRegime: "Old",
    income: {
      monthlyIncome: 140000,
      salaryType: "Salary",
      employmentType: "Private",
      cityCategory: "Tier1",
      taxRegime: "Old",
      riskProfile: "Conservative",
      totalIncome: 140000,
    },
    expenses: [
      { id: "e-fam-1", category: "HOUSING", amount: 35000, title: "3BHK Rental home", isRecurring: true },
      { id: "e-fam-2", category: "FOOD", amount: 18000, title: "Groceries & Milk supply" },
      { id: "e-fam-3", category: "DEBT_EMI", amount: 22000, title: "Car Loan EMI", isRecurring: true },
      { id: "e-fam-4", category: "OTHERS", amount: 15000, title: "Kid School Fees", isRecurring: true },
      { id: "e-fam-5", category: "HEALTHCARE", amount: 6000, title: "Parents Medicine & Doctor visits" },
      { id: "e-fam-6", category: "UTILITIES", amount: 8000, title: "Bills & Maintenance" }
    ],
    goals: [
      { id: "g-fam-1", category: "EMERGENCY_FUND", title: "Family Protection Reserve", targetAmount: 300000, currentAmount: 180000, targetDate: "2026-12-31", monthlyAllocation: 15000 },
      { id: "g-fam-2", category: "EDUCATION", title: "Higher Education Corpus", targetAmount: 1500000, currentAmount: 350000, targetDate: "2035-05-31", monthlyAllocation: 10000 }
    ],
    assets: [
      { id: "a-fam-1", name: "HDFC Savings Account", category: "Bank", value: 150000 },
      { id: "a-fam-2", name: "Sovereign Gold Bonds", category: "Gold", value: 200000 },
      { id: "a-fam-3", name: "NPS Tier 1", category: "PF/NPS", value: 300000 }
    ],
    liabilities: [
      { id: "l-fam-1", name: "HDFC Car Loan", category: "Car Loan", totalAmount: 800000, remaining: 420000, interestRate: 8.5, monthlyEmi: 22000 }
    ]
  },

  high_income: {
    id: "profile-high-income",
    name: "Dr. Aditya Sen",
    email: "aditya.sen@medclinic.org",
    occupation: "Business",
    cityTier: "METRO",
    monthlySalary: 320000,
    riskProfile: "AGGRESSIVE",
    taxRegime: "New",
    income: {
      monthlyIncome: 320000,
      salaryType: "Business",
      employmentType: "Business Owner",
      cityCategory: "Tier1",
      taxRegime: "New",
      riskProfile: "Aggressive",
      totalIncome: 320000,
    },
    expenses: [
      { id: "e-hi-1", category: "HOUSING", amount: 65000, title: "Villa Maintenance & Rent", isRecurring: true },
      { id: "e-hi-2", category: "FOOD", amount: 30000, title: "Fine Dining & Premium Groceries" },
      { id: "e-hi-3", category: "DEBT_EMI", amount: 45000, title: "Home Loan EMI", isRecurring: true },
      { id: "e-hi-4", category: "SHOPPING", amount: 35000, title: "High-end Retail & Tech" },
      { id: "e-hi-5", category: "ENTERTAINMENT", amount: 25000, title: "Club Memberships & Travel" },
      { id: "e-hi-6", category: "UTILITIES", amount: 15000, title: "Premium Plans & Gadget Insurances" }
    ],
    goals: [
      { id: "g-hi-1", category: "RETIREMENT", title: "Early Retirement Corpus", targetAmount: 50000000, currentAmount: 18000000, targetDate: "2040-12-31", monthlyAllocation: 100000 },
      { id: "g-hi-2", category: "VACATION", title: "Annual Europe Trip", targetAmount: 600000, currentAmount: 400000, targetDate: "2026-06-30", monthlyAllocation: 30000 }
    ],
    assets: [
      { id: "a-hi-1", name: "Premium Equities Brokerage", category: "Stocks", value: 12000000 },
      { id: "a-hi-2", name: "Sovereign Debt Funds", category: "Mutual Funds", value: 4500000 },
      { id: "a-hi-3", name: "Bengaluru Land Parcel", category: "Real Estate", value: 18000000 }
    ],
    liabilities: [
      { id: "l-hi-1", name: "SBI Home Loan", category: "Home Loan", totalAmount: 12000000, remaining: 8500000, interestRate: 8.4, monthlyEmi: 45000 }
    ]
  },

  low_income: {
    id: "profile-low-income",
    name: "Sunil Paswan",
    email: "sunil.paswan@logistics.co.in",
    occupation: "Salaried",
    cityTier: "TIER_3",
    monthlySalary: 18000,
    riskProfile: "CONSERVATIVE",
    taxRegime: "New",
    income: {
      monthlyIncome: 18000,
      salaryType: "Salary",
      employmentType: "Contract",
      cityCategory: "Tier3",
      taxRegime: "New",
      riskProfile: "Conservative",
      totalIncome: 18000,
    },
    expenses: [
      { id: "e-lo-1", category: "HOUSING", amount: 5000, title: "Room Rental", isRecurring: true },
      { id: "e-lo-2", category: "FOOD", amount: 6000, title: "Basic Groceries & Milk" },
      { id: "e-lo-3", category: "DEBT_EMI", amount: 4000, title: "Micro-loan EMI", isRecurring: true },
      { id: "e-lo-4", category: "UTILITIES", amount: 1500, title: "Mobile & cooking gas" }
    ],
    goals: [
      { id: "g-lo-1", category: "EMERGENCY_FUND", title: "Safety Fund", targetAmount: 20000, currentAmount: 1500, targetDate: "2027-12-31", monthlyAllocation: 800 }
    ],
    assets: [
      { id: "a-lo-1", name: "Savings Post Office Account", category: "Bank", value: 3000 }
    ],
    liabilities: [
      { id: "l-lo-1", name: "Microfinance Loan", category: "Personal Loan", totalAmount: 40000, remaining: 18000, interestRate: 14.5, monthlyEmi: 4000 }
    ]
  },

  business_owner: {
    id: "profile-business",
    name: "Gaurav Chawla",
    email: "gaurav@chawlasweets.com",
    occupation: "Business",
    cityTier: "TIER_2",
    monthlySalary: 110000,
    riskProfile: "AGGRESSIVE",
    taxRegime: "Old",
    income: {
      monthlyIncome: 110000,
      salaryType: "Business",
      employmentType: "Self Employed",
      cityCategory: "Tier2",
      taxRegime: "Old",
      riskProfile: "Aggressive",
      totalIncome: 110000,
      freelanceIncome: 0,
      rentalIncome: 15000, // additional rental income
    },
    expenses: [
      { id: "e-biz-1", category: "HOUSING", amount: 20000, title: "Apartment Rent", isRecurring: true },
      { id: "e-biz-2", category: "FOOD", amount: 15000, title: "Groceries & Cafe dinners" },
      { id: "e-biz-3", category: "DEBT_EMI", amount: 25000, title: "Business Equipment EMI", isRecurring: true },
      { id: "e-biz-4", category: "UTILITIES", amount: 12000, title: "Commercial Electricity & Shop Wi-Fi" },
      { id: "e-biz-5", category: "SHOPPING", amount: 10000, title: "Apparel & Electronics" }
    ],
    goals: [
      { id: "g-biz-1", category: "OTHER", title: "Shop Renovation Reserve", targetAmount: 500000, currentAmount: 150000, targetDate: "2027-08-31", monthlyAllocation: 15000 }
    ],
    assets: [
      { id: "a-biz-1", name: "Shop Inventory & Goods", category: "Bank", value: 800000 },
      { id: "a-biz-2", name: "FD sweeps with Punjab National Bank", category: "Bank", value: 350000 }
    ],
    liabilities: [
      { id: "l-biz-1", name: "Shop Machinery Loan", category: "Personal Loan", totalAmount: 600000, remaining: 320000, interestRate: 11.2, monthlyEmi: 25000 }
    ]
  },

  retired: {
    id: "profile-retired",
    name: "Major Devender Pal (Retd.)",
    email: "devpal.99@vetmail.in",
    occupation: "Salaried", // closest match for enum
    cityTier: "TIER_2",
    monthlySalary: 62000,
    riskProfile: "CONSERVATIVE",
    taxRegime: "Old",
    income: {
      monthlyIncome: 62000,
      salaryType: "Retired",
      employmentType: "Government",
      cityCategory: "Tier2",
      taxRegime: "Old",
      riskProfile: "Conservative",
      totalIncome: 62000,
      otherIncome: 18000, // Monthly Pension / Interest Yields
    },
    expenses: [
      { id: "e-ret-1", category: "HOUSING", amount: 8000, title: "Society Maintenance & Taxes", isRecurring: true },
      { id: "e-ret-2", category: "FOOD", amount: 12000, title: "Groceries & Organic Diet" },
      { id: "e-ret-3", category: "HEALTHCARE", amount: 14000, title: "Regular Cardiac checkups & Daily Pills", isRecurring: true },
      { id: "e-ret-4", category: "UTILITIES", amount: 5000, title: "Bills & TV dish recharge" },
      { id: "e-ret-5", category: "OTHERS", amount: 6000, title: "Gifts for Grandchildren" }
    ],
    goals: [
      { id: "g-ret-1", category: "VACATION", title: "Char Dham Yatra Tour", targetAmount: 120000, currentAmount: 90000, targetDate: "2026-09-30", monthlyAllocation: 10000 }
    ],
    assets: [
      { id: "a-ret-1", name: "Senior Citizen Savings Scheme (SCSS)", category: "PF/NPS", value: 1500000 },
      { id: "a-ret-2", name: "Post Office Monthly Income Scheme", category: "PF/NPS", value: 900000 },
      { id: "a-ret-3", name: "Gold Coins & Jewelry", category: "Gold", value: 1200000 }
    ],
    liabilities: []
  },

  investor: {
    id: "profile-investor",
    name: "Karan Johar (Tech Lead)",
    email: "karan.tech@eng.com",
    occupation: "Salaried",
    cityTier: "METRO",
    monthlySalary: 180000,
    riskProfile: "AGGRESSIVE",
    taxRegime: "New",
    income: {
      monthlyIncome: 180000,
      salaryType: "Salary",
      employmentType: "Private",
      cityCategory: "Tier1",
      taxRegime: "New",
      riskProfile: "Aggressive",
      totalIncome: 180000,
      investmentIncome: 22000, // Monthly dividends / stock cashouts
    },
    expenses: [
      { id: "e-inv-1", category: "HOUSING", amount: 45000, title: "Rent in Metro (Whitefield)", isRecurring: true },
      { id: "e-inv-2", category: "FOOD", amount: 18000, title: "Weekly Outings & Groceries" },
      { id: "e-inv-3", category: "TRANSPORT", amount: 8000, title: "Cabs & Fuel" },
      { id: "e-inv-4", category: "UTILITIES", amount: 7000, title: "Wi-Fi & Streaming apps bundle" },
      { id: "e-inv-5", category: "SHOPPING", amount: 15000, title: "Gadgets & Apparel" }
    ],
    goals: [
      { id: "g-inv-1", category: "INVESTMENT", title: "Grow SIP Portfolio", targetAmount: 20000000, currentAmount: 4800000, targetDate: "2032-12-31", monthlyAllocation: 60000 },
      { id: "g-inv-2", category: "EMERGENCY_FUND", title: "Dynamic Safety Fund", targetAmount: 400000, currentAmount: 380000, targetDate: "2026-08-31", monthlyAllocation: 10000 }
    ],
    assets: [
      { id: "a-inv-1", name: "Groww Stocks & Index Portfolio", category: "Stocks", value: 3500000 },
      { id: "a-inv-2", name: "Parag Parikh Flexicap & Smallcap Mutual Funds", category: "Mutual Funds", value: 1300000 }
    ],
    liabilities: []
  },

  debt_heavy: {
    id: "profile-debt-heavy",
    name: "Suresh Pillai",
    email: "suresh.p@telecom.in",
    occupation: "Salaried",
    cityTier: "TIER_2",
    monthlySalary: 60000,
    riskProfile: "CONSERVATIVE",
    taxRegime: "New",
    income: {
      monthlyIncome: 60000,
      salaryType: "Salary",
      employmentType: "Private",
      cityCategory: "Tier2",
      taxRegime: "New",
      riskProfile: "Conservative",
      totalIncome: 60000,
    },
    expenses: [
      { id: "e-dh-1", category: "HOUSING", amount: 14000, title: "House Rent", isRecurring: true },
      { id: "e-dh-2", category: "FOOD", amount: 10000, title: "Food & Household items" },
      { id: "e-dh-3", category: "DEBT_EMI", amount: 32000, title: "Credit Card & Personal Loan EMI", isRecurring: true },
      { id: "e-dh-4", category: "UTILITIES", amount: 4000, title: "Electricity & DTH" }
    ],
    goals: [
      { id: "g-dh-1", category: "EMERGENCY_FUND", title: "Starter Safety Buffer", targetAmount: 50000, currentAmount: 2000, targetDate: "2027-12-31", monthlyAllocation: 1000 }
    ],
    assets: [
      { id: "a-dh-1", name: "SBI Savings Balance", category: "Bank", value: 8000 }
    ],
    liabilities: [
      { id: "l-dh-1", name: "HDFC Personal Loan", category: "Personal Loan", totalAmount: 400000, remaining: 280000, interestRate: 13.5, monthlyEmi: 18000 },
      { id: "l-dh-2", name: "ICICI Credit Card Rollover Debt", category: "Credit Card", totalAmount: 180000, remaining: 180000, interestRate: 42.0, monthlyEmi: 14000 }
    ]
  },

  minimal_data: {
    id: "profile-minimal",
    name: "Pooja Roy",
    email: "pooja.roy@freelance.io",
    occupation: "Freelancer",
    cityTier: "TIER_2",
    monthlySalary: 50000,
    riskProfile: "MODERATE",
    taxRegime: "New",
    income: {
      monthlyIncome: 50000,
      salaryType: "Freelancer",
      employmentType: "Self Employed",
      cityCategory: "Tier2",
      taxRegime: "New",
      riskProfile: "Balanced",
      totalIncome: 50000,
    },
    expenses: [],
    goals: [],
    assets: [],
    liabilities: []
  }
};
