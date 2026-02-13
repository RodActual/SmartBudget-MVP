# FortisBudget - Personal Finance Dashboard

A modern, privacy-first budgeting application built for students and young professionals who want to learn financial discipline through mindful tracking.

## Overview

FortisBudget is a completely free, full-featured budgeting tool that helps you track expenses, set budgets, and visualize spending patterns, without ads, subscriptions, or data monetization. Built with React and Firebase, it provides real-time synchronization and intelligent insights to help you make better financial decisions.

**Live Demo:** <https://fortisbudget.com>

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
- **Inactivity auto-logout** - 15-minute timeout with 2-minute warning
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

### Backend & Database

- **Firebase Authentication** - User management and security
- **Firestore** - Real-time NoSQL database with automatic scaling
- **Firebase SDK** - Direct client-side integration (no custom backend server)

### Deployment

- **Vercel** - Serverless frontend hosting with automatic deployments
- **Firebase Hosting** - CDN for global asset delivery
- **GitHub** - Version control and CI/CD integration

### Key Architecture Decisions

- **Serverless design** - No backend server to maintain (Firebase handles everything)
- **Real-time listeners** - onSnapshot for instant UI updates
- **Client-side calculations** - Budget spent amounts calculated from transactions
- **Zero operational cost** - Firebase free tier supports 50K reads/day

## Project Structure

```
FortisBudget/
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
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   ├── App.tsx              # Main application component
│   │   ├── firebase.js          # Firebase configuration
│   │   ├── globals.css          # Global styles and Tailwind config
│   │   └── main.jsx             # Application entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env.example                 # Environment variable template
├── SECURITY.md                  # Security documentation
├── ENVIRONMENT_SETUP.md         # Setup guide
└── README.md
```

## Getting Started

**For complete setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account (free tier)
- Vercel account (optional, for deployment)

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/RodActual/FortisBudget.git
cd FortisBudget/frontend
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

```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed Firebase setup instructions.

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

#### `userSettings`

```javascript
{
  userId: string,              // Firebase Auth UID
  userName: string,            // Display name
  savingsGoal: number,         // Target savings amount
  notificationsEnabled: boolean,
  alertSettings: {
    budgetWarningEnabled: boolean,
    budgetWarningThreshold: number,
    budgetExceededEnabled: boolean,
    largeTransactionEnabled: boolean,
    largeTransactionAmount: number,
    weeklyReportEnabled: boolean,
    dismissedAlertIds: string[]
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
  type: "income" | "expense", // Transaction type
  archived: boolean           // Soft delete flag
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

## Design Philosophy

### Manual Entry as a Feature

Unlike competitors that prioritize automatic bank synchronization, FortisBudget treats manual entry as a **learning tool**:

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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables (all `VITE_FIREBASE_*` values)
4. Deploy!

Vercel will automatically deploy on every push to main.

### Firebase Hosting

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

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

### Planned Features

- [ ] Recurring transactions
- [ ] Data export (CSV/PDF)
- [ ] PWA for mobile install
- [ ] Plaid integration for bank sync (optional)
- [ ] Dark mode
- [ ] Multi-user/household budgets
- [ ] Budget templates
- [ ] Goal forecasting

## Contributing

Contributions are welcome! This project is being developed as part of a university capstone project (CIT 457/458).

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use Tailwind utility classes for styling
- Keep components small and focused
- Comment complex logic

## Security

For security guidelines and best practices, see [SECURITY.md](./SECURITY.md)

Key points:
- Firebase API keys are public identifiers (not secret)
- Security comes from Firestore Security Rules
- Never commit `.env` files
- Report vulnerabilities to anthony15s.email@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Anthony Rodriguez**

- University: Miami University Regionals
- Course: CIT 457 (Fall 2025) / CIT 458 (Spring 2026)
- GitHub: [@RodActual](https://github.com/RodActual)
- Email: anthony15s.email@gmail.com

## Acknowledgments

- **Firebase** - Backend infrastructure and authentication
- **Vercel** - Hosting and deployment
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling framework
- **Lucide** - Icon system

## Support

For issues, questions, or feature requests:

- Open an issue on [GitHub Issues](https://github.com/RodActual/FortisBudget/issues)
- Email: anthony15s.email@gmail.com

---

**Built for students who want to take control of their finances without breaking the bank.**