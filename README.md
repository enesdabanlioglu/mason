# Mason - Mutual Connections App

## Features
- **Import Contacts:** Connect Google Contacts (and placeholders for LinkedIn, WhatsApp, Instagram).
- **My Contacts:** View and manage your contacts securely.
- **Search:** Search across the network for names or companies (privacy-focused).
- **Mutual Connections:** Discover shared contacts with other users.
- **Dark Mode:** Fully supported.

## Setup

### Prerequisites
- Node.js 18+
- Supabase Project
- Google Cloud Project (for OAuth)

### Environment Variables
Create `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=your-32-char-encryption-key
```

**To generate ENCRYPTION_KEY:**
```bash
openssl rand -hex 16
```

### Database Setup (CRITICAL - Must be done first!)

**You MUST run these migrations in Supabase before using the app!**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content of `supabase/migrations/20240101000000_init.sql` and paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for success message
8. Create a new query and run `supabase/migrations/20240101000001_add_contacts_constraint.sql`

**Alternative: Using Supabase CLI**
```bash
supabase db push
```

**Verify tables were created:**
- Go to **Table Editor** in Supabase Dashboard
- You should see: `profiles`, `contacts`, `user_platform_connections`

### Google OAuth Setup

**Important:** You need to configure OAuth for TWO different purposes:
1. **User Authentication (Supabase Auth)** - for user login
2. **Google Contacts Integration** - for importing contacts

#### Step 1: Configure OAuth Consent Screen
**This is required before creating OAuth credentials!**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Go to **APIs & Services** > **OAuth consent screen**
4. Choose **External** (unless you have a Google Workspace account)
5. Fill in the required information:
   - **App name**: `Mason` (or your app name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
6. Click **Save and Continue**
7. On **Scopes** page, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/contacts.readonly`
8. Click **Save and Continue**
9. On **Test users** page, click **Add Users** and add your email address
10. Click **Save and Continue**

#### Step 2: Enable APIs
1. Go to **APIs & Services** > **Library**
2. Search for and enable: **People API** (for Google Contacts)

#### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add these **Authorized redirect URIs**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback` (for Supabase Auth)
   - `http://localhost:3000/api/auth/google/callback` (for Contacts import - dev)
   - `https://yourdomain.com/api/auth/google/callback` (for Contacts import - production)
5. Copy the **Client ID** and **Client Secret**

#### Step 4: Configure Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Enter your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
5. Save the configuration

### Running Locally
```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Troubleshooting

### "Could not find the table 'public.user_platform_connections'"
**Solution:** You haven't run the database migrations yet. See "Database Setup" section above.

### OAuth errors
- Make sure you've added your email to "Test users" in OAuth consent screen
- Verify redirect URIs are correct in Google Cloud Console
- Check that People API is enabled

## Security Notes
- Contact data is protected by RLS (Row Level Security).
- OAuth tokens are encrypted before storage.
- Search is performed via a secure RPC function that limits returned data.
