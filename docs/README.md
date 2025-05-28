# Services

This directory contains server-side services that are separated from the Mastra framework for better modularity and maintainability.

## 🚀 **Automatic Startup (Recommended)**

The system now **automatically initializes** when your Next.js app starts! 

### **First Time Setup:**
1. Set environment variable: `RUN_BEGINNING_STACK=true` in your `.env.local`
2. Start your Next.js app: `npm run dev` or `npm run build && npm start`
3. The system will automatically:
   - Fetch beginning stack (1000 papers) 
   - Start daily renewal scheduler
   - Log progress to console

### **Subsequent Runs:**
- Remove or set `RUN_BEGINNING_STACK=false`
- App will start with scheduler only (no re-fetch of beginning stack)

### **Environment Variables for Startup:**
```env
# Controls automatic beginning stack fetch on startup
RUN_BEGINNING_STACK=true          # For first time setup
RUN_BEGINNING_STACK=false         # For regular restarts

# Or use this for more control
AUTO_INIT=true                    # Force auto-initialization
```

## Structure

```
services/
├── arxiv/                 # Arxiv paper management
│   ├── scraper.ts        # Paper fetching from arxiv API
│   ├── renewal.ts        # Daily renewal and vector storage
│   └── index.ts          # Exports for arxiv service
├── scheduler.ts          # Daily renewal scheduler
├── init.ts               # Service initialization
├── index.ts              # Main services exports
├── startup.ts            # Automatic startup logic
└── README.md            # This file
```

## Manual Initialization Options

If you prefer manual control or need to re-initialize:

### 🔧 **Option 1: Via API Routes**

```bash
# RECOMMENDED FOR FIRST TIME: Beginning stack + scheduler
curl -X POST http://localhost:3000/api/init?beginning-stack=true

# Development: Yesterday papers + scheduler  
curl -X POST http://localhost:3000/api/init?immediate=true

# Production restart: Scheduler only
curl -X POST http://localhost:3000/api/init
```

### 💻 **Option 2: Standalone Script**

```bash
node scripts/start-services.js
```

This will:
- Fetch beginning stack (1000 papers)
- Start daily renewal at 6 AM UTC  
- Keep running until you stop it (Ctrl+C)

### 📅 **Option 3: Direct Function Calls**

```typescript
import { 
  initializeServicesWithBeginningStack,
  initializeServicesWithImmediateRun,
  initializeServices 
} from '@/services/init';

// RECOMMENDED: Beginning stack + scheduler
await initializeServicesWithBeginningStack();

// Development: Yesterday papers + scheduler
await initializeServicesWithImmediateRun();

// Basic: Scheduler only
initializeServices();
```

### ⏰ **Option 4: External Cron Jobs**

Set up system cron job:

```bash
# Yesterday papers (fetches ALL papers for that date)
0 6 * * * curl -X POST http://localhost:3000/api/services/arxiv/renewal?type=yesterday

# Or beginning stack
0 6 * * * curl -X POST http://localhost:3000/api/services/arxiv/renewal?type=beginning-stack
```

## How It Works

### **Automatic Startup Flow:**
1. **App starts** → `layout.tsx` imports `startup.ts`
2. **Startup checks** environment variables
3. **If first time** (`RUN_BEGINNING_STACK=true`):
   - Fetches beginning stack (1000 papers)
   - Starts daily renewal scheduler
4. **If regular restart**:
   - Starts scheduler only
5. **Daily at 6 AM UTC**: Fetches ALL yesterday's papers

### **Manual Triggers Flow:**
```bash
# Trigger specific renewals anytime
curl -X POST http://localhost:3000/api/services/arxiv/renewal?type=yesterday
curl -X POST http://localhost:3000/api/services/arxiv/renewal?type=beginning-stack
```

## Renewal Modes

### 📅 **Yesterday Mode (Default)**
- Fetches **ALL papers** from yesterday's date (not limited)
- Uses pagination to get complete results (up to 2000 per API call)
- **Automatically checks for duplicates** using paper IDs
- Only processes and stores new papers
- Includes 3-second delays between API calls to be nice to arXiv servers

### 🔄 **Beginning Stack Mode**
- Fetches up to **1000 recent papers**
- Useful for initial database seeding
- Still includes duplicate checking

### 🔄 **Duplicate Prevention**

The system automatically:
1. **Fetches papers** from arxiv API (ALL papers for yesterday)
2. **Checks existing papers** by ID in vector database
3. **Filters out duplicates** before processing
4. **Generates embeddings** only for new papers
5. **Stores only new papers** in vector database

This means you can:
- Run renewal multiple times safely
- Use different fetching modes without duplicates  
- Save on OpenAI embedding costs
- Keep your vector database clean

## Monitoring

### **Check Status:**
```bash
# Check if services are initialized
curl http://localhost:3000/api/init

# Manual renewal status  
curl http://localhost:3000/api/services/arxiv/renewal
```

### **Logs:**
The system provides detailed console logging:
- 🚀 Startup progress
- 📚 Beginning stack progress
- 🔄 Daily renewal execution
- ✅ Success confirmations
- ❌ Error details

## Environment Variables

```env
# Arxiv Configuration
CATEGORIES=cs.AI,cs.LG,cs.CL  # Arxiv categories to monitor

# Vector Database
UPSTASH_VECTOR_REST_URL=your_url
UPSTASH_VECTOR_TOKEN=your_token

# OpenAI
OPENAI_API_KEY=your_openai_key

# Startup Control
RUN_BEGINNING_STACK=true      # Fetch beginning stack on startup
AUTO_INIT=true               # Force auto-initialization
```

## Production Deployment

### **Recommended Production Setup:**

1. **First Deployment:**
   ```env
   RUN_BEGINNING_STACK=true
   NODE_ENV=production
   ```

2. **Deploy & Start:**
   ```bash
   npm run build
   npm start
   ```
   
3. **Subsequent Deployments:**
   ```env
   RUN_BEGINNING_STACK=false
   NODE_ENV=production
   ```

4. **Monitor Logs:**
   - Look for 🚀 startup messages
   - Verify ✅ success confirmations
   - Check 🔄 daily renewal schedule

## Integration with Mastra

The services are designed to work alongside Mastra tools. Mastra agents use their own vector store configuration for memory management, while the arxiv service uses the native Upstash SDK for better performance and control.

## Migration Notes

- **Automatic startup** now handles beginning stack fetching
- **Environment variables** control startup behavior
- **Yesterday mode** fetches **ALL papers** for the date using pagination (not limited to 300)
- **Duplicate prevention** ensures no wasteful reprocessing
- **Vector storage** uses native Upstash Vector SDK for better performance 