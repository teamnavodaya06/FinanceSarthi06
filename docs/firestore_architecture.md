# Technical Specification: Enterprise Firestore Subcollection Architecture

This document specifies the Firestore database architecture for **FinanceSarthi**. It details the subcollection structure designed to isolate user records, optimize performance, simplify security constraints, and scale to hundreds of thousands of concurrent users.

---

## 🏛️ Firestore Database Hierarchy

All user-specific data is nested under the `/users/{uid}` document path. Each module represents an isolated subcollection namespace, preventing monolithic document bloat and minimizing client fetch overhead.

```
/users/{uid} (Parent Document)
│
├── profile (Subcollection)
│      └── basic (Document)
│             ├── uid: String
│             ├── displayName: String
│             ├── email: String
│             ├── occupation: String
│             ├── cityTier: String
│             ├── monthlySalary: Number
│             └── ... (demographics)
│
├── income (Subcollection)
│      └── current (Document)
│             ├── monthlyIncome: Number
│             ├── annualIncome: Number (monthly × 12)
│             ├── totalIncome: Number (monthly + additional)
│             ├── taxRegime: String ("Old" | "New")
│             ├── riskProfile: String
│             └── ...
│
├── expenses (Subcollection)
│      └── {expenseId} (Documents)
│             ├── title: String
│             ├── category: String
│             ├── amount: Number
│             ├── date: String (YYYY-MM-DD)
│             └── isRecurring: Boolean
│
├── goals (Subcollection)
│      └── {goalId} (Documents)
│             ├── title: String
│             ├── targetAmount: Number
│             ├── currentAmount: Number
│             └── isCompleted: Boolean
│
├── investments (Subcollection)
│      └── {id} (Documents - Maps to Net Worth Assets)
│             ├── name: String
│             ├── category: String ("Bank" | "Mutual Funds" | "Stocks" | ...)
│             └── value: Number
│
├── loans (Subcollection)
│      └── {id} (Documents - Maps to Net Worth Liabilities)
│             ├── name: String
│             ├── category: String ("Car Loan" | "Home Loan" | ...)
│             └── remaining: Number
│
├── budget (Subcollection)
│      └── current (Document)
│             ├── monthlyBudget: Number
│             ├── spent: Number
│             └── AIRecommendation: String
│
├── netWorth (Subcollection)
│      └── current (Document)
│             ├── cash: Number
│             ├── bank: Number
│             ├── mutualFunds: Number
│             ├── stocks: Number
│             ├── totalAssets: Number (denormalized aggregate)
│             ├── totalLiabilities: Number (denormalized aggregate)
│             └── netWorth: Number (assets - liabilities)
│
├── aiReports (Subcollection)
│      └── {reportId} (Documents)
│             ├── title: String
│             ├── summary: String
│             ├── recommendations: Array<String>
│             └── generatedAt: String
│
├── notifications (Subcollection)
│      └── {notificationId} (Documents)
│             ├── title: String
│             ├── message: String
│             ├── priority: String
│             └── isRead: Boolean
│
├── settings (Subcollection)
│      └── current (Document)
│             ├── theme: String ("dark" | "light")
│             ├── language: String
│             └── notifications: Boolean
│
└── activityLogs (Subcollection)
       └── {logId} (Documents)
              ├── event: String ("login" | "profileUpdate" | "expenseCreated" | ...)
              ├── details: Map
              └── timestamp: String
```

---

## 🔒 Firestore Security Rules (`firestore.rules`)

We enforce strict data isolation at the routing namespace using wildcard captures:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check authentication
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check path ownership matches token UID
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /profile/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /income/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /expenses/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /goals/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /investments/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /loans/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /budget/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /netWorth/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /aiReports/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /notifications/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /settings/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /activityLogs/{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## ⚙️ Service-Repository Pattern CRUD Flows

All database reads, writes, and mutations are wrapped in a modular repository architecture:

1. **Base Repository (`base.repo.ts`)**: Resolves current authenticated Firebase Auth context UID safely and exposes helper operations (`getSubcollectionRef`, `getDocRef`, `getSingleDocument`, `createInSubcollection`).
2. **Denormalized Aggregation**: When adding investments or loans, the subcollection services automatically trigger background denormalization tasks to update `/users/{uid}/netWorth/current` totals, avoiding complex runtime page computations.
