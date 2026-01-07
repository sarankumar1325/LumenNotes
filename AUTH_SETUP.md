# Lumen - Authentication Setup Guide

## Quick Start

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project

2. **Run Database Setup**
   - Open Supabase Dashboard → SQL Editor
   - Copy and run the contents of `supabase-setup.sql`

3. **Configure Authentication**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Set "Confirm email" to enabled
   - Configure your email template (or use default)

4. **Get API Credentials**
   - Go to Settings → API
   - Copy the Project URL
   - Copy the anon/public key

### 2. Environment Variables

Create `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 3. Run the Application

```bash
npm run dev
```

## Features Implemented

### Authentication
- Sign up with email/password
- Sign in with email/password
- Password reset via email
- Session management (1-day expiry)
- Auto-profile creation on signup

### Security
- Row Level Security (RLS) policies
- Users can only access their own notes
- JWT token management handled by Supabase client

### UI Features
- Landing page with hero section
- Login/Signup/Forgot Password forms
- Real-time sync indicator
- User profile dropdown with sign out
- Protected routes

## File Structure

```
src/
├── auth/
│   ├── AuthContext.tsx      # Global auth state
│   └── ProtectedRoute.tsx   # Route guard
├── components/
│   ├── AuthForm.tsx         # Login/Signup/Forgot forms
│   ├── LandingPage.tsx      # Marketing page
│   └── ResetPasswordPage.tsx # Password reset
├── App.tsx                  # Main app with notes
├── supabase.ts              # Supabase client & API
└── index.tsx                # Entry with routing
```

## Supabase Dashboard Configuration

### Email Templates
- Authentication → URL Configuration
- Set Site URL to your local: `http://localhost:5173`
- Set Redirect URLs: `http://localhost:5173/reset-password`

### Session Settings
- Authentication → Sessions
- Session timeout: 86400 seconds (1 day)

### Row Level Security
- The RLS policies in supabase-setup.sql ensure:
  - Users can only view/edit their own notes
  - Profiles are tied to auth.users

## Troubleshooting

**Build errors**: Run `npm run build` to check for issues

**Auth not working**: Check browser console for Supabase errors

**Database errors**: Verify SQL was run in Supabase SQL Editor

**Session expired**: Sign out and sign back in
