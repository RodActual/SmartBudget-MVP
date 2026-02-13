# Security Guidelines for FortisBudget

## Firebase Configuration Security

### Understanding Firebase API Keys

**Important:** Firebase API keys in your `.env` file are **NOT secret**. They are used to identify your Firebase project and are safe to expose in client-side code.

According to [Firebase documentation](https://firebase.google.com/docs/projects/api-keys):
> "Unlike how API keys are typically used, API keys for Firebase services are not used to control access to backend resources; that can only be done with Firebase Security Rules."

### Where Security Actually Happens

Your application's security comes from:

1. **Firestore Security Rules** (Database level)
   - Already configured in `/firestore.rules`
   - Ensures users can only access their own data
   - Prevents unauthorized reads/writes

2. **Firebase Authentication** (User level)
   - Email verification required
   - Password strength requirements
   - Session management with auto-logout

3. **Application Logic** (Code level)
   - Input validation
   - XSS prevention
   - CSRF protection

## Environment Variable Setup

### Development Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Never commit `.env`:**
   - The file is already in `.gitignore`
   - Only commit `.env.example` (template with no real values)

3. **Fill in your Firebase credentials:**
   - Get them from Firebase Console > Project Settings
   - Paste into `.env` (not `.env.example`)

### Production Setup

For production deployments, set environment variables in your hosting platform:

#### Vercel
1. Go to Project Settings > Environment Variables
2. Add each `VITE_FIREBASE_*` variable
3. Redeploy your application

#### Netlify
1. Go to Site Settings > Build & Deploy > Environment
2. Add each `VITE_FIREBASE_*` variable
3. Trigger a new deploy

#### Firebase Hosting
1. Use `.env.production` locally
2. Build with production env vars
3. Deploy the built files

## Additional Security Measures

### 1. Restrict API Keys (Optional but Recommended)

While not required, you can add extra protection:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your Firebase API key
4. Click "Restrict key" and add:
   - **HTTP referrers:** `fortisbudget.com`, `*.vercel.app`
   - **APIs:** Only enable Firebase services you use

### 2. Firebase Security Rules

Ensure your Firestore rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Authentication Security

Already implemented:
- ✅ Email verification required
- ✅ Password minimum 6 characters (Firebase default)
- ✅ 15-minute inactivity timeout
- ✅ Secure session management

Consider adding:
- [ ] Two-factor authentication (2FA)
- [ ] Password strength meter
- [ ] Rate limiting on login attempts

### 4. Client-Side Security

Already implemented:
- ✅ XSS prevention via React (automatic escaping)
- ✅ Input validation on all forms
- ✅ HTTPS-only (enforced by modern hosting)

## What NOT to Commit

❌ **Never commit these files:**
- `.env` (actual credentials)
- `serviceAccountKey.json` (Firebase admin SDK)
- Any file with real API keys, passwords, or tokens

✅ **Safe to commit:**
- `.env.example` (template with placeholder values)
- Firebase config in code (API keys are public identifiers)
- Firestore security rules

## Security Checklist

Before deploying to production:

- [ ] `.env` file is in `.gitignore`
- [ ] All environment variables set in hosting platform
- [ ] Firestore Security Rules deployed
- [ ] Email verification enabled
- [ ] HTTPS enforced (automatic on Vercel/Netlify)
- [ ] Admin routes protected (if applicable)
- [ ] Regular dependency updates (`npm audit`)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT open a public GitHub issue**
2. Email: anthony15s.email@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#why-do-multiple-jsx-tags-need-to-be-wrapped)

---

**Last Updated:** February 13, 2026  
**Maintained by:** Anthony Rodriguez