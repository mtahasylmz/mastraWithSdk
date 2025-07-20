# arXiv AI Chat System

A Next.js application that fetches daily arXiv research abstracts, stores them in Upstash Vector database with OpenAI embeddings, and provides an AI-powered chat interface using the Mastra framework for intelligent research paper discovery and discussion.

## Development Setup

### Prerequisites
- Node.js 18+
- Separate Mastra server instance

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Upstash Vector Database
UPSTASH_VECTOR_REST_URL=your_vector_db_url
UPSTASH_VECTOR_TOKEN=your_vector_db_token

# Upstash Redis (Memory & Rate Limiting)
UPSTASH_REDIS_MEMORY_URL=your_redis_url
UPSTASH_REDIS_MEMORY_TOKEN=your_redis_token

# Mastra Framework
NEXT_PUBLIC_MASTRA_API=your_mastra_server_url

# arXiv Configuration
CATEGORIES=cs.AI,cs.LG,cs.CL
RUN_BEGINNING_STACK=true
```

### Running the Application

```bash
# Start development server
npm run dev

# In a separate terminal, start your Mastra server
# (Required for AI agent functionality)
```

## Technical Overview

### Core Components

- **Vector Storage**: Upstash Vector database stores research abstracts embedded with OpenAI's GPT-4o
- **AI Framework**: Mastra TypeScript framework powers intelligent agents for research paper analysis
- **Data Source**: Daily fresh abstracts from arXiv API based on configured categories
- **Rate Limiting**: Upstash Redis-based rate limiting for API usage control
- **Memory**: Redis for conversation history and caching

### arXiv Categories

Configure `CATEGORIES` with comma-separated arXiv categories (e.g., `cs.AI,cs.LG,cs.CL`). Find more categories at the [arXiv Category Taxonomy](https://arxiv.org/category_taxonomy).

### Initial Data Loading

Set `RUN_BEGINNING_STACK=true` to automatically fetch ~30,000 relevant articles on server initialization, building a comprehensive knowledge base for AI-powered research discovery. 