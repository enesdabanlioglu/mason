#!/bin/bash
# Vercel Environment Variables Setup Script
# Run this after: vercel login

PROJECT_ID="prj_GQv6R1PS8PsuuipNV3A6BToLpTCO"

echo "Setting up environment variables for Mason project..."

# Required Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Google OAuth variables
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# App URL (update with your actual production URL)
vercel env add NEXT_PUBLIC_APP_URL production

# Encryption key (optional, will use SUPABASE_SERVICE_ROLE_KEY if not set)
vercel env add ENCRYPTION_KEY production

echo "Environment variables added. Don't forget to add them for preview and development environments too!"

