import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FinanceSarthi database...');

  // Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@financesarthi.in' },
    update: {},
    create: {
      email: 'demo@financesarthi.in',
      name: 'Rohan Sharma',
      passwordHash,
      cityTier: 'TIER_2',
      monthlyIncome: 85000,
    },
  });

  console.log(`👤 Demo User created: ${demoUser.email} (ID: ${demoUser.id})`);

  // Salary Profile
  await prisma.salaryProfile.create({
    data: {
      userId: demoUser.id,
      grossMonthly: 85000,
      basicSalary: 42500,
      hraReceived: 17000,
      specialAllowance: 25500,
      regime: 'NEW',
      needsPercent: 50,
      wantsPercent: 30,
      savingsPercent: 20,
    },
  });

  // Demo Expenses
  await prisma.expense.createMany({
    data: [
      { userId: demoUser.id, title: 'House Rent', amount: 18000, category: 'HOUSING', isRecurring: true, date: new Date('2026-07-01') },
      { userId: demoUser.id, title: 'Swiggy Gourmet & Groceries', amount: 8400, category: 'FOOD', isRecurring: false, date: new Date('2026-07-05') },
      { userId: demoUser.id, title: 'Electricity & Wi-Fi Bill', amount: 3200, category: 'UTILITIES', isRecurring: true, date: new Date('2026-07-10') },
      { userId: demoUser.id, title: 'Netflix & Spotify Premium', amount: 999, category: 'ENTERTAINMENT', isRecurring: true, date: new Date('2026-07-12') },
      { userId: demoUser.id, title: 'Car EMI', amount: 12500, category: 'DEBT_EMI', isRecurring: true, date: new Date('2026-07-15') },
      { userId: demoUser.id, title: 'SIP Investment (Nifty 50 Index)', amount: 15000, category: 'INVESTMENT', isRecurring: true, date: new Date('2026-07-02') },
    ],
  });

  // Demo Goals
  await prisma.goal.createMany({
    data: [
      {
        userId: demoUser.id,
        title: '6-Month Emergency Safety Fund',
        category: 'EMERGENCY_FUND',
        targetAmount: 300000,
        currentAmount: 180000,
        targetDate: new Date('2026-12-31'),
        monthlyAllocation: 20000,
      },
      {
        userId: demoUser.id,
        title: 'New Electric SUV Down Payment',
        category: 'VEHICLE',
        targetAmount: 500000,
        currentAmount: 220000,
        targetDate: new Date('2027-06-30'),
        monthlyAllocation: 15000,
      },
      {
        userId: demoUser.id,
        title: 'House Property Fund',
        category: 'HOUSE',
        targetAmount: 2500000,
        currentAmount: 450000,
        targetDate: new Date('2030-12-31'),
        monthlyAllocation: 25000,
      },
    ],
  });

  // Demo Assets & Liabilities
  await prisma.asset.createMany({
    data: [
      { userId: demoUser.id, name: 'HDFC Savings Account', category: 'Bank', value: 145000 },
      { userId: demoUser.id, name: 'Zerodha Mutual Fund Portfolio', category: 'Mutual Funds', value: 380000 },
      { userId: demoUser.id, name: 'EPF & VPF Balance', category: 'PF/NPS', value: 290000 },
      { userId: demoUser.id, name: 'Sovereign Gold Bonds (SGB)', category: 'Gold', value: 85000 },
    ],
  });

  await prisma.liability.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'HDFC Car Loan',
        category: 'Car Loan',
        totalAmount: 600000,
        remaining: 320000,
        interestRate: 8.75,
        monthlyEmi: 12500,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
