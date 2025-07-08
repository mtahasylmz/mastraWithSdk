# Mastra Article Agent 🤖📚

A sophisticated AI-powered research assistant built with **Next.js 15**, **Mastra Framework**, and **Supabase Authentication**. This application helps users discover, analyze, and discuss academic papers through an intelligent chat interface.

## ✨ Features

### 🔐 **Secure Multi-User Authentication**
- JWT-based authentication with Supabase
- Email verification workflow
- User isolation - each user gets their own private workspace
- Session management with automatic token refresh
- Beautiful login/signup interfaces with shadcn/ui

### 🤖 **AI-Powered Research Assistant**
- Chat with an intelligent agent trained on academic papers
- Real-time streaming responses
- Context-aware conversations with memory
- Article recommendations based on queries
- Tool-enhanced responses with reasoning display

### 📊 **Smart Paper Management**
- ArXiv paper integration with 1000+ papers
- Vector database storage with Upstash
- Automatic daily paper updates
- Category filtering (AI, ML, CV, NLP, Robotics)
- Semantic search capabilities

### 💬 **Advanced Chat Interface**
- Thread-based conversation management
- Rich message formatting with tool invocations
- User-specific conversation history
- Responsive design for all devices
- Real-time typing indicators and streaming

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │   Supabase      │    │   Mastra SDK    │
│   Frontend       │◄──►│   Auth & Data   │◄──►│   AI Framework  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Upstash       │    │   OpenAI API    │
                    │   Vector DB     │◄──►│   GPT Models    │
                    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Upstash Vector database

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd mastra-article-agent
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual credentials
```

Required environment variables:
```env
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI & Vector Database
OPENAI_API_KEY=your_openai_api_key
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# Mastra Configuration
NEXT_PUBLIC_MASTRA_API=http://localhost:4111
```

### 3. Set Up Supabase
1. Create a new Supabase project
2. Enable Email authentication
3. Configure redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Start Development
```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

## 🔐 Authentication System

### User Flow
1. **Sign Up**: Create account with email verification
2. **Login**: Secure JWT-based authentication  
3. **Isolated Workspace**: Each user gets private conversations
4. **Session Management**: Automatic token refresh
5. **Logout**: Clean session termination

### Key Features
- **Route Protection**: All pages require authentication
- **Dynamic Resource IDs**: User-specific data isolation
- **Email Verification**: Required for account activation
- **Responsive UI**: Beautiful forms with validation
- **Error Handling**: Clear feedback for auth issues

## 📖 Usage Guide

### Getting Started
1. **Sign up** for a new account or **log in**
2. **Verify your email** (check spam folder if needed)
3. **Start chatting** with the AI research assistant
4. **Ask questions** about academic papers or research topics

### Example Queries
- "Find papers about transformer architectures"
- "Explain attention mechanisms in neural networks"
- "Recent advances in computer vision"
- "Compare different machine learning approaches"

### Features Overview
- **Create Threads**: Start new conversation topics
- **Message History**: Access past conversations
- **Tool Invocations**: See how AI searches papers
- **Reasoning Display**: Understand AI thought process
- **User Menu**: Access profile and logout

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Authentication pages
│   ├── signup/            
│   ├── auth/callback/     # Email verification
│   └── layout.tsx         # Root layout with auth
├── components/            # React components
│   ├── chat/             # Chat interface components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── hooks/                # Custom React hooks
│   ├── useThreads.ts     # Thread management
│   ├── useMessages.ts    # Message handling
│   └── useMessageStream.ts # Real-time streaming
├── lib/                  # Utility libraries
│   ├── supabase/         # Authentication utilities
│   └── mastra-config.ts  # AI configuration
├── mastra/               # Mastra framework integration
│   ├── agents/           # AI agents and memory
│   └── tools/            # Custom AI tools
└── services/             # Backend services
    ├── arxiv/            # Paper scraping
    └── scheduler.ts      # Daily updates
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **AI Framework**: Mastra SDK
- **Database**: Supabase + Upstash Vector
- **Language Model**: OpenAI GPT
- **Deployment**: Vercel-ready

### Architecture Decisions
- **Server Components**: Leverage Next.js 15 performance
- **Route Protection**: Middleware-based security
- **State Management**: React Context + Custom Hooks
- **Real-time Updates**: AI streaming with incremental updates
- **Type Safety**: Full TypeScript implementation

## 📚 Documentation

Detailed documentation available in the `docs/` directory:

- [**Authentication Guide**](docs/AUTHENTICATION_README.md) - Complete auth system overview
- [**Environment Setup**](docs/ENVIRONMENT_SETUP.md) - Configuration guide  
- [**Chat Interface**](docs/CHAT_INTERFACE_README.md) - UI components guide
- [**Mastra Integration**](docs/MASTRA_INTEGRATION_README.md) - AI framework setup
- [**Services Documentation**](docs/README.md) - Backend services guide

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Update Supabase redirect URLs to production domain
5. Deploy automatically on push

### Environment Variables for Production
```env
# Update these for production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Site URL in Supabase: https://yourdomain.com
# Redirect URLs: https://yourdomain.com/auth/callback
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mastra Framework** - AI agent infrastructure
- **Supabase** - Authentication and database
- **Upstash** - Vector database for paper storage
- **OpenAI** - Language model capabilities
- **shadcn/ui** - Beautiful UI components
- **ArXiv** - Academic paper data source

## 🐛 Troubleshooting

### Common Issues

**Authentication not working:**
- Verify Supabase credentials in `.env.local`
- Check email authentication is enabled in Supabase
- Ensure redirect URLs are configured correctly

**AI responses not working:**
- Verify OpenAI API key is valid and has credits
- Check Mastra API is running on correct port
- Look for errors in browser console

**Papers not loading:**
- Verify Upstash Vector credentials
- Check if beginning stack has been initialized
- Review server logs for ArXiv API issues

For more help, check the [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md) or open an issue.

---

Built with ❤️ using Next.js 15, Mastra, and Supabase 