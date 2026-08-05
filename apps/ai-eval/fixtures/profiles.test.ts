import { describe, it, expect } from 'vitest';
import { TEST_PROFILES } from './profiles';

describe('Test User Profiles Fixtures', () => {
  it('should verify all target profiles are correctly typed and registered', () => {
    const profileKeys = Object.keys(TEST_PROFILES);
    expect(profileKeys).toContain('student');
    expect(profileKeys).toContain('young_professional');
    expect(profileKeys).toContain('family');
    expect(profileKeys).toContain('high_income');
    expect(profileKeys).toContain('low_income');
    expect(profileKeys).toContain('business_owner');
    expect(profileKeys).toContain('retired');
    expect(profileKeys).toContain('investor');
    expect(profileKeys).toContain('debt_heavy');
    expect(profileKeys).toContain('minimal_data');
  });

  it('should assert specific financial thresholds on profile assets, incomes, and liabilities', () => {
    const student = TEST_PROFILES.student;
    expect(student.monthlySalary).toBe(12000);
    expect(student.expenses.length).toBe(4);
    expect(student.goals.length).toBe(1);

    const family = TEST_PROFILES.family;
    expect(family.monthlySalary).toBe(140000);
    expect(family.cityTier).toBe('METRO');
    expect(family.liabilities.length).toBe(1);
    expect(family.liabilities[0].interestRate).toBe(8.5);

    const highIncome = TEST_PROFILES.high_income;
    expect(highIncome.monthlySalary).toBe(320000);
    expect(highIncome.riskProfile).toBe('AGGRESSIVE');
  });
});
