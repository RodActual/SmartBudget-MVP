# Environment Setup Instructions

## Quick Start for New Developers

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/FortisBudget.git
cd FortisBudget/frontend
npm install
```

### 2. Set Up Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it `FortisBudget` (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click "Create project"

#### Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Click "Save"

#### Enable Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select a location (choose closest to your users)
5. Click "Enable"

#### Get Your Firebase Config

1. In Firebase Console, click the ⚙️ gear icon > **Project settings**
2. Scroll down to "Your apps"
3. Click the web icon `</>` to add a web app
4. Register app with nickname "FortisBudget Web"
5. Copy the `firebaseConfig` object

### 3. Configure Environment Variables

#### Create Your .env File

```bash
# In the frontend/ directory
cp .env.example .env
```

#### Fill in Your Firebase Credentials

Open `.env` and replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**⚠️ Important:** Never commit your `.env` file to Git!

### 4. Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab
3. Replace the default rules with:

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

4. Click **Publish**

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app running!

### 6. Create Your First Account

1. Click "Get Started" or "Sign Up"
2. Enter an email and password
3. Check your email for verification link
4. Click the verification link
5. Complete the welcome setup

## Troubleshooting

### Firebase Connection Issues

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Check that your API key is correct in `.env`
- Ensure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

**Error: "Missing or insufficient permissions"**
- Verify your Firestore Security Rules are published
- Check that you're logged in
- Ensure your email is verified

**Error: "CORS policy blocked"**
- Add `localhost:5173` to your Firebase authorized domains
- Go to Authentication > Settings > Authorized domains

### Build Issues

**Error: "Cannot find module 'firebase'"**
```bash
npm install
```

**Error: "Vite environment variable not defined"**
- Ensure your `.env` file is in the `frontend/` directory
- Check that all variables start with `VITE_`
- Restart your dev server

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - Go to Project Settings > Environment Variables
   - Add all `VITE_FIREBASE_*` variables from your `.env`
6. Deploy!

### Firebase Hosting

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

## Security Notes

- **API Keys are Public:** Firebase API keys are meant to be public
- **Security = Rules:** Real security comes from Firestore Security Rules
- **Never Commit:** Never commit `.env` files to Git
- **See SECURITY.md** for complete security guidelines

## Need Help?

- 📖 [Firebase Documentation](https://firebase.google.com/docs)
- 🔐 [Security Guidelines](./SECURITY.md)
- 🐛 [Report Issues](https://github.com/RodActual/FortisBudget/issues)
- 📧 Email: anthony15s.email@gmail.com