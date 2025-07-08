# Environment Setup Guide

This document outlines all the environment variables required for the Mastra Article Agent application with JWT-based authentication.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### 🔐 Supabase Authentication (Required)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 🤖 Mastra Configuration

```env
NEXT_PUBLIC_MASTRA_API=http://localhost:4111
NEXT_PUBLIC_RESOURCE_ID=articleAgent
```

### 🧠 OpenAI Configuration (Required)

```env
OPENAI_API_KEY=your_openai_api_key
```

**How to get this:**
1. Create an [OpenAI](https://platform.openai.com) account
2. Go to API Keys section
3. Create a new secret key

### 📊 Upstash Vector Configuration (Required)

```env
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
```

**How to get these:**
1. Create an [Upstash](https://upstash.com) account
2. Create a new Vector Database
3. Copy the REST URL and token from the dashboard

### 📚 ArXiv Configuration (Optional)

```env
CATEGORIES=cs.AI,cs.LG,cs.CV,cs.CL,cs.RO
RUN_BEGINNING_STACK=false
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mastra-article-agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### 4. Set Up Supabase Authentication

1. **Enable Email Authentication:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Settings
   - Enable Email authentication
   - Configure email templates if desired

2. **Configure Auth Settings:**
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Start the Development Server
```bash
npm run dev
```

### 6. First-Time Setup (Optional)
If you want to populate the database with initial papers:
```env
RUN_BEGINNING_STACK=true
```
Set this to `true` only for the first run, then change it back to `false`.

## User Flow

1. **Authentication:**
   - Users must sign up/login to access the application
   - Email verification is required for new accounts
   - User sessions are managed with Supabase Auth

2. **Dynamic Resource IDs:**
   - Each authenticated user gets their own isolated data
   - Threads and messages are scoped to the user's ID
   - No cross-user data access

3. **Chat Interface:**
   - Full-featured chat with AI research assistant
   - Article research and paper recommendations
   - Conversation memory and context

## Troubleshooting

### Common Issues

1. **Authentication not working:**
   - Verify Supabase URL and keys are correct
   - Check that email authentication is enabled in Supabase
   - Ensure redirect URLs are configured properly

2. **Chat not loading:**
   - Verify NEXT_PUBLIC_MASTRA_API is correct
   - Ensure OpenAI API key is valid
   - Check browser console for errors

3. **Papers not loading:**
   - Verify Upstash Vector credentials
   - Check if beginning stack has been initialized
   - Look at server logs for arXiv API issues

### Environment Variable Validation

The application will validate critical environment variables on startup and show clear error messages if any are missing.

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific URLs for production
- Rotate API keys regularly
- Enable RLS (Row Level Security) in Supabase if needed

## Production Deployment

For production, update these values:
- Site URL to your production domain
- Redirect URLs to your production callback URLs
- Use production Upstash and OpenAI endpoints if different 