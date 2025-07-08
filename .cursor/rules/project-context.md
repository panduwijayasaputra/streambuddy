# StreamBuddy - Indonesian Gaming AI Co-Host - Project Rules

## Project Overview

StreamBuddy is a full-stack web application that provides an AI-powered co-host for Indonesian gaming streamers. The system monitors stream chat, intelligently responds to viewer questions about games, and provides contextual gaming information while streamers focus on gameplay.

## Tech Stack

- **Monorepo**: npm/yarn workspaces
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS with TypeScript, PostgreSQL, TypeORM
- **AI**: OpenAI API integration
- **Real-time**: WebSocket connections
- **Database**: Local PostgreSQL instance

## Project Structure

```
stream-buddy/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS API
├── packages/
│   └── shared/            # Shared types and utilities
├── package.json           # Root workspace config
└── README.md
```

## Core Business Logic

### Target Market

- Indonesian gaming streamers (DeanKT, Reza Arap, MiawAug, Windah Basudara, Jess No Limit)
- 6-10k concurrent viewers per major stream
- Mixed Indonesian/English gaming terminology
- Cost-sensitive solution ($3-8 per 4-hour stream)

### Supported Games (Priority Order)

1. **Mobile Legends: Bang Bang** - #1 priority, MOBA
2. **Free Fire & Free Fire MAX** - Battle royale
3. **Valorant** - Tactical FPS
4. **GTA V (RP Servers)** - Roleplay, very popular with Indonesian streamers
5. **PUBG Mobile** - Battle royale, esports
6. **Horror Games Collection** - Indie horror, high engagement
7. **Minecraft** - Creative/building
8. **Genshin Impact** - Action RPG, gacha
9. **Ragnarok X: Next Generation** - MMORPG revival
10. **Call of Duty: Mobile** - Mobile FPS

### Package.json Configuration

```json
{
  "name": "stream-buddy",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/frontend & npm run start:dev --workspace=apps/backend",
    "build": "npm run build --workspace=apps/frontend && npm run build --workspace=apps/backend",
    "start": "npm run start --workspace=apps/frontend & npm run start:prod --workspace=apps/backend"
  }
}
```

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/stream_buddy_db
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_NAME=StreamBuddy
```

## Brand Guidelines

### StreamBuddy Brand Identity

- **Primary Color**: Gaming-focused blue (#1E40AF)
- **Secondary Color**: Indonesian red (#DC2626)
- **Accent Color**: Success green (#059669)
- **Typography**: Modern, clean fonts that work well in Indonesian and English
- **Logo**: Friendly AI character or chat bubble with Indonesian gaming elements

### Messaging

- **Tagline**: "Your Gaming Stream Companion"
- **Indonesian Tagline**: "Teman Setia Streamer Gaming"
- **Value Proposition**: "AI yang paham gaming Indonesia" Pipeline

```
Raw Chat (100%) → Spam Filter (20%) → AI-Directed (5%) → Template Check (2%) → API Call (Final)
```

### Database Schema (PostgreSQL)

```sql
-- Database name: stream_buddy_db

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  subscriber_status BOOLEAN DEFAULT false,
  donor_status BOOLEAN DEFAULT false,
  follow_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  indonesian_terms JSONB,
  common_questions JSONB,
  meta_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  stream_id UUID,
  processed BOOLEAN DEFAULT false,
  ai_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI responses template table
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_pattern VARCHAR(500) NOT NULL,
  response_template TEXT NOT NULL,
  game_context VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stream sessions table
CREATE TABLE stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_name VARCHAR(255) NOT NULL,
  game_being_played VARCHAR(255),
  viewer_count INTEGER DEFAULT 0,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP
);
```

## API Endpoints

### StreamBuddy REST API

```typescript
// Authentication & Users
POST   /api/auth/login
GET    /api/users/profile
PUT    /api/users/settings

// Stream Management
POST   /api/streams/connect     // WebSocket upgrade
GET    /api/streams/active
POST   /api/streams/disconnect
GET    /api/streams/:id/analytics

// Chat Processing
POST   /api/chat/process-message
GET    /api/chat/templates
POST   /api/chat/templates
GET    /api/chat/history/:streamId

// AI Responses
POST   /api/ai/generate-response
GET    /api/ai/cached-responses
POST   /api/ai/feedback
GET    /api/ai/usage-stats

// Game Knowledge
GET    /api/games
GET    /api/games/:id/context
POST   /api/games/:id/questions
PUT    /api/games/:id/meta
```

## StreamBuddy Features

### Core Components

1. **StreamBuddy Dashboard** (`/dashboard`)
2. **StreamBuddy Overlay** (`/overlay`)
3. **StreamBuddy Settings** (`/settings`)
4. **StreamBuddy Analytics** (`/analytics`)

### AI Personality

- **Name**: StreamBuddy
- **Personality**: Friendly, knowledgeable Indonesian gaming companion
- **Voice**: Casual but helpful, uses appropriate Indonesian gaming slang
- **Expertise**: Deep knowledge of Indonesian gaming culture and terminology

## Chat Processing Pipeline

### Code Quality Standards

- Always use TypeScript with strict mode
- Follow functional programming patterns where possible
- Use ESLint and Prettier configurations
- Implement proper error handling and logging
- Write comprehensive unit tests for business logic

### Frontend Guidelines (StreamBuddy UI)

- Use shadcn/ui components exclusively for UI consistency
- Implement StreamBuddy branding with gaming-focused color scheme
- Use React Query for server state management
- Design StreamBuddy overlay for OBS browser source compatibility
- Implement smooth animations for StreamBuddy responses
- Support both light/dark themes for different streaming setups

### Backend Guidelines (StreamBuddy API)

- Follow NestJS best practices with StreamBuddy modules
- Implement StreamBuddy chat processing service
- Use WebSocket for real-time StreamBuddy responses
- Implement StreamBuddy cost optimization algorithms
- Create StreamBuddy analytics tracking system

## StreamBuddy Indonesian Context

### Language Processing for StreamBuddy

- Handle mixed Indonesian/English gaming terms naturally
- Support Jakarta gaming slang and regional dialects
- Implement case-insensitive matching for Indonesian text
- Use proper Indonesian grammar in StreamBuddy responses
- Recognize streamer names and gaming personalities

### StreamBuddy Gaming Knowledge Base

```typescript
interface StreamBuddyGamingTerms {
  mobileLegends: {
    "build [hero]": "Build terbaik untuk {hero}: {items}. StreamBuddy recommend banget!";
    "counter [hero]": "StreamBuddy tau nih! {hero} bisa di-counter pakai {counterHeroes}";
    "meta hero": "Meta hero terkuat kata StreamBuddy: {currentMetaList}";
  };
  valorant: {
    "agent mudah": "StreamBuddy saranin agent pemula: Sage, Reyna, Omen";
    "tips aim": "Tips aim dari StreamBuddy: sensitivity rendah, crosshair placement";
  };
  gtaRp: {
    "server rp bagus": "Server RP Indonesia favorit StreamBuddy: {rpServersList}";
    "cara masuk rp": "StreamBuddy jelasin: daftar whitelist dulu, baca rules server";
  };
}
```

## Performance Requirements for StreamBuddy

### High-Volume Chat Handling for StreamBuddy

- Process 50-200 messages/minute for major Indonesian streamers
- Maintain 85% template response coverage with StreamBuddy knowledge
- StreamBuddy response time under 3 seconds
- Cost optimization: 15-25 OpenAI API calls per hour maximum
- Handle 6-10k concurrent viewers for top streamers (DeanKT, Reza Arap level)

### StreamBuddy MVP Development Phases

#### Phase 1: Core StreamBuddy (Weeks 1-4)

1. Basic StreamBuddy chat monitoring and filtering
2. Template response system for top 3 games (Mobile Legends, Free Fire, Valorant)
3. Simple StreamBuddy dashboard with stream connection
4. Basic StreamBuddy OBS overlay component

#### Phase 2: Smart StreamBuddy (Weeks 5-8)

5. OpenAI integration with StreamBuddy cost optimization
6. All 10 games knowledge base for StreamBuddy
7. Advanced chat processing with StreamBuddy batching
8. StreamBuddy analytics dashboard

#### Phase 3: Pro StreamBuddy (Weeks 9-12)

9. High-volume stream optimization for StreamBuddy
10. Advanced Indonesian language processing for StreamBuddy
11. Real-time StreamBuddy performance monitoring
12. Production deployment setup for StreamBuddy

## StreamBuddy Code Quality Standards

- Always use TypeScript with strict mode for StreamBuddy components
- Follow functional programming patterns in StreamBuddy logic
- Implement comprehensive error handling for StreamBuddy AI processing
- Write unit tests for all StreamBuddy business logic
- Use proper logging for StreamBuddy chat processing pipeline

Remember: StreamBuddy is designed to be the perfect gaming companion for Indonesian streamers, understanding both the gaming culture and language nuances that make Indonesian gaming streams unique.
