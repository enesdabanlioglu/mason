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
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000`)
- `ENCRYPTION_KEY` (32-char string for token encryption)

### Database Setup
Run the migrations in `supabase/migrations` in your Supabase SQL Editor.
1. `20240101000000_init.sql`
2. `20240101000001_add_contacts_constraint.sql`

### Google OAuth Setup
1. Create a project in Google Cloud Console.
2. Enable "People API" (Google Contacts).
3. Create OAuth 2.0 Credentials.
4. Add Redirect URI: `http://localhost:3000/api/auth/google/callback` (and your production URL).
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Running Locally
```bash
npm install
npm run dev
```

## Security Notes
- Contact data is protected by RLS (Row Level Security).
- OAuth tokens are encrypted before storage.
- Search is performed via a secure RPC function that limits returned data.
