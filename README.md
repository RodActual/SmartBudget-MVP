# SmartBudget - Personal Finance Dashboard

A modern, privacy-first budgeting application built for students and young professionals who want to learn financial discipline through mindful tracking.

## Overview

SmartBudget is a completely free, full-featured budgeting tool that helps you track expenses, set budgets, and visualize spending patterns, without ads, subscriptions, or data monetization. Built with React and Firebase, it provides real-time synchronization and intelligent insights to help you make better financial decisions.

**Live Demo:** <https://smartbudget-mvp.vercel.app>

## Key Features

### Transaction Management

- **Track both income and expenses** with detailed categorization
- **Add, edit, and delete transactions** with real-time updates
- **90-day smart archiving** - bulk delete old transactions to keep your dashboard fast
- **Manual entry encourages mindfulness** - know where every dollar goes

### Budget Tracking

- **Unlimited custom categories** with color-coding for visual clarity
- **Automatic monthly reset** on the 1st of each month
- **Real-time spending calculations** - see your progress instantly
- **Visual progress bars** with color-coded warnings (green → amber → red → black)
- **8 default categories** to get started quickly (Housing, Food, Transportation, etc.)

### Visual Analytics

- **Pie charts** - spending distribution by category
- **Bar charts** - budget vs. actual comparison
- **Line charts** - spending trends over time
- **All powered by Recharts** for smooth, interactive visualizations

### Smart Alerts

- **Customizable budget warnings** (default: 80% threshold)
- **Budget exceeded notifications** (100% threshold)
- **Large transaction alerts** (customizable amount, default: $500)
- **Persistent dismissal** - dismissed alerts stay dismissed across sessions
- **Notification bell** with unread count and full alert management

### Security & Privacy

- **Firebase Authentication** - secure email/password login
- **Password management** - change password with re-authentication
- **Inactivity auto-logout** - 15-minute timeout with 2-minute warning (unique feature!)
- **Full account deletion** - complete data cleanup (transactions, budgets, settings)
- **No data monetization** - your data stays yours, forever
- **Firestore security rules** - user data isolation at database level

### User Experience

- **Real-time sync** using Firebase onSnapshot listeners
- **Responsive design** - works on desktop, tablet, and mobile
- **Fast load times** - serverless architecture via Vercel + Firebase
- **Clean, modern UI** - built with shadcn/ui components and Tailwind CSS
- **Savings goal tracking** - set targets and monitor progress
- **Dark mode ready** - CSS variables in place for future implementation

## Technology Stack

### Frontend

- **React 18** - Modern UI library with hooks
- **TypeScript/JSX** - Type-safe component development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality, accessible component library
- **Recharts** - Composable charting library for data visualization
- **Lucide React** - Beautiful icon system

### Backend

- **Firebase Authentication** - User management and security
- **Firestore** - Real-time NoSQL database with automatic scaling
- **Firebase SDK** - Direct client-side integration (no custom backend server)

### Deployment

- **Vercel** - Serverless frontend hosting with automatic deployments
- **Firebase Hosting** - CDN for global asset delivery
- **GitHub** - Version control and CI/CD integration

### Key Architecture Decisions

- **Serverless design** - No backend server to maintain (Firebase handles it)
- **Real-time listeners** - onSnapshot for instant UI updates
- **Client-side calculations** - Budget spent amounts calculated from transactions
- **Zero operational cost** - Firebase free tier supports 50K reads/day

## Project Structure

```
smartbudget/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AddTransactionDialog.tsx    # Transaction entry form
│   │   │   ├── AlertsNotificationBell.tsx  # Alert system with bell icon
│   │   │   ├── BudgetManager.tsx           # Budget CRUD and editing
│   │   │   ├── ChartsInsights.tsx          # Charts tab with all visualizations
│   │   │   ├── DashboardOverview.tsx       # Main dashboard summary
│   │   │   ├── ExpenseTracking.tsx         # Transactions list and management
│   │   │   ├── LoginForm.tsx               # Authentication UI
│   │   │   ├── SettingsPage.tsx            # User settings and account management
│   │   │   ├── SpendingChart.tsx           # Line chart for trends
│   │   │   └── TransactionsTable.tsx       # Table view of transactions
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── utils.tsx
│   │   ├── App.tsx              # Main application component
│   │   ├── firebase.js          # Firebase configuration
│   │   ├── globals.css          # Global styles and Tailwind config
│   │   └── main.jsx             # Application entry point
│   ├── public/
│   │   └── smartbudget-logo.png
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                      # Exploratory backend (not used in production)
│   ├── routes/                   # Flask routes (reference only)
│   ├── utils/                    # Firebase utilities
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account (free tier)
- Vercel account (optional, for deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/smartbudget.git
cd smartbudget/frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Firebase**

- Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable **Authentication** (Email/Password provider)
- Enable **Firestore Database** (production mode)
- Copy your Firebase config

4. **Configure environment variables**

Create a `.env` file in the `frontend/` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. **Set up Firestore security rules**

In Firebase Console → Firestore Database → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User settings
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Transactions - user can only access their own
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    // Budgets - user can only access their own
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

6. **Run development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running locally.

### Building for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## Database Schema

### Collections

#### `users` (created by Firebase Auth)

- Managed automatically by Firebase Authentication
- User profiles stored in `userSettings` collection

#### `userSettings`

```javascript
{
  userId: string,              // Firebase Auth UID
  userName: string,            // Display name
  savingsGoal: number,         // Target savings amount
  notificationsEnabled: boolean,
  alertSettings: {
    budgetWarningEnabled: boolean,
    budgetWarningThreshold: number,  // Percentage (e.g., 80)
    budgetExceededEnabled: boolean,
    largeTransactionEnabled: boolean,
    largeTransactionAmount: number,  // Dollar amount (e.g., 500)
    weeklyReportEnabled: boolean,
    dismissedAlertIds: string[]      // Persistent dismissed alerts
  },
  updatedAt: string           // ISO timestamp
}
```

#### `transactions`

```javascript
{
  userId: string,             // Owner of transaction
  date: string,               // ISO date (YYYY-MM-DD)
  description: string,        // Transaction description
  category: string,           // Budget category
  amount: number,             // Dollar amount
  type: "income" | "expense"  // Transaction type
}
```

#### `budgets`

```javascript
{
  userId: string,             // Owner of budget
  category: string,           // Category name
  budgeted: number,           // Budget limit amount
  color: string,              // Hex color for UI (#3B82F6)
  lastReset: number           // Timestamp of last reset
  // Note: 'spent' is calculated client-side from transactions
}
```

### Data Flow

1. **User logs in** → Firebase Auth creates session
2. **App loads** → onSnapshot listeners subscribe to user’s data
3. **User adds transaction** → addDoc to Firestore
4. **Firestore updates** → onSnapshot fires → React re-renders
5. **Budget calculation** → Client-side aggregation of current month’s transactions
6. **Alerts generated** → Compared against alertSettings, filtered by dismissedAlertIds

## Design Philosophy

### Manual Entry as a Feature

Unlike competitors that prioritize automatic bank synchronization, SmartBudget treats manual entry as a **learning tool**:

- Forces awareness of every transaction
- Builds mindful spending habits
- Eliminates privacy concerns (no bank credentials)
- Works globally (no bank API restrictions)

### Privacy First

- **No data monetization** - your data is never sold or shared
- **No advertisements** - clean, distraction-free interface
- **No tracking pixels** - only Firebase Analytics (optional)
- **True data deletion** - account deletion removes everything
- **User data isolation** - Firestore security rules prevent cross-user access

### Educational Focus

Built specifically for students and young professionals:

- Simple enough to learn in 5 minutes
- Visual feedback reinforces good habits
- No methodology lock-in (use any budgeting style)
- Free forever (no premium tier upsells)

## Feature Roadmap

### Completed (MVP)

- [x] User authentication and session management
- [x] Transaction CRUD (income and expenses)
- [x] Budget creation and management
- [x] Real-time data synchronization
- [x] Visual analytics (Pie, Bar, Line charts)
- [x] Smart alert system with customization
- [x] Monthly auto-reset
- [x] 90-day bulk archive
- [x] Inactivity auto-logout
- [x] Password change and account deletion
- [x] Savings goal tracking
- [x] Persistent alert dismissal

### In Progress

- [ ] Recurring transactions
- [ ] Data export (CSV/PDF)
- [ ] PWA for mobile install
- [ ] Onboarding tutorial

### Planned Features

- [ ] Plaid integration for bank sync (optional)
- [ ] Extended history options (30/90/180/365 days)
- [ ] Dark mode
- [ ] Native mobile apps (iOS/Android)
- [ ] Multi-user/household budgets
- [ ] Localization (Spanish, French, German, Mandarin)
- [ ] 2FA (two-factor authentication)
- [ ] Budget templates
- [ ] Goal forecasting
- [ ] Spending insights and patterns

## Testing

### Manual Testing Checklist

- [x] User registration and login
- [x] Transaction CRUD operations
- [x] Budget creation and editing
- [x] Real-time sync across browser tabs
- [x] Alert generation and dismissal
- [x] Monthly budget reset logic
- [x] 90-day archive functionality
- [x] Password change flow
- [x] Account deletion with data cleanup
- [x] Inactivity timeout and warning
- [x] Responsive design (desktop, tablet, mobile)

### Future Testing

- [ ] Firebase emulator for local testing
- [ ] Jest/React Testing Library for unit tests
- [ ] Cypress for E2E testing
- [ ] Lighthouse for performance auditing

## Contributing

Contributions are welcome! This project is being developed as part of a university capstone project (CIT 457/458).

### Development Guidelines

1. Fork the repository
1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
1. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
1. Push to the branch (`git push origin feature/AmazingFeature`)
1. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use Tailwind utility classes for styling
- Keep components small and focused
- Comment complex logic

## License

This project is licensed under the MIT License - see the <LICENSE> file for details.

## Author

**Anthony Rodriguez**

- University: Miami University Regionals
- Course: CIT 457 (Fall 2025) / CIT 458 (Spring 2026)
- GitHub: [@Anthony-Rodriguez](https://github.com/Anthony-Rodriguez)

## Acknowledgments

- **Firebase** - Backend infrastructure and authentication
- **Vercel** - Hosting and deployment
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling framework
- **Lucide** - Icon system

## Support

For issues, questions, or feature requests:

- Open an issue on [GitHub Issues](https://github.com/RodActual/smartbudget/issues)
- Email: anthony15s.email@gmail.com

## Related Documentation

- [Project Book](https://docs.google.com/document/d/your-doc-id) - Complete project documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

-----

**Built for students who want to take control of their finances without breaking the bank.**