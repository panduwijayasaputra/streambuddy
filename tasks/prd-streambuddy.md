# Product Requirements Document (PRD): StreamBuddy

## 1. Introduction / Overview

StreamBuddy is an AI-powered co-host designed for Indonesian gaming streamers. It monitors stream chat, intelligently responds to viewer questions about games, and provides contextual gaming information, allowing streamers to focus on gameplay. StreamBuddy only responds when directly mentioned (e.g., "Hi @StreamBuddy"), and can answer both game-related and stream context questions (e.g., "@StreamBuddy, udah berapa lama streamingnya?").

StreamBuddy should be personalized and customizable by the streamer, including its display name (default: @buddy). The AI should be visually represented as an avatar with a chat bubble overlay in the stream.

## 2. Goals

- Reduce streamer distraction by automatically handling repetitive chat questions and providing real-time game information.
- Provide accurate, context-aware responses to both game and stream-related queries.
- Support high chat volumes (50-200 messages/minute) with low latency (response time < 3 seconds).
- Achieve 85%+ template response coverage for common questions.
- Support 8 games at launch (Mobile Legends, Dota, GTA V Roleplay, Free Fire, Valorant, Call of Duty, Magic Chest, Delta Force).
- Maintain cost per stream under $8.

## 3. User Stories

- As a streamer, I want StreamBuddy to answer repetitive chat questions so I can focus on gameplay.
- As a viewer, I want to get quick, accurate answers about the game being played by mentioning the AI.
- As a streamer, I want to see analytics about chat engagement and StreamBuddy's performance.
- As a viewer, I want to ask about the current stream context (e.g., how long the stream has been running) and get a direct answer from StreamBuddy.

## 4. Functional Requirements

1. The system must monitor and filter chat messages in real time.
2. The system must only respond to messages where the AI is directly mentioned (e.g., "@StreamBuddy").
3. The system must answer common game-related questions using a template or AI-generated response.
4. The system must answer stream context questions (e.g., stream duration, current game, viewer count).
5. The system must provide analytics to streamers about chat engagement and StreamBuddy's activity.
6. The system must integrate with OBS overlays for displaying StreamBuddy responses.
7. The system must support both Indonesian and English gaming terminology, including slang.
8. The system must handle high chat volumes (up to 200 messages/minute) efficiently.
9. The system must support the top 3 games at launch, with extensibility for more games.
10. The system must use cost-optimized OpenAI API calls (max 15-25 per hour).
11. The system must use Next.js (frontend), NestJS (backend), PostgreSQL (database), and WebSocket for real-time features.
12. The system must use shadcn/ui components and StreamBuddy brand colors for UI.
13. The system must support both light and dark themes.
14. The system must provide proper error handling for API rate limits and failures.
15. The system must not answer or compare games/servers outside the current stream context (e.g., do not recommend other servers if the streamer is playing on a specific one).
16. The system must allow streamers to personalize and customize the AI, including its display name (default: @buddy), avatar, and chat bubble appearance based on custom personalization.
17. The system must display the AI as an avatar with a chat bubble overlay in the stream.

## 5. Non-Goals (Out of Scope)

- StreamBuddy will not moderate chat for toxicity or inappropriate content.
- StreamBuddy will not handle stream video or audio processing.
- StreamBuddy will not replace human moderators.
- StreamBuddy will not compare or recommend games/servers outside the current stream context.

## 6. Design Considerations

- Use StreamBuddy brand colors: Primary (Gaming Blue #1E40AF), Secondary (Indonesian Red #DC2626), Accent (Success Green #059669).
- Use shadcn/ui components for UI consistency.
- Modern, clean, gaming-focused look and feel.
- Support both light and dark themes for different streaming setups.
- Overlay component must be compatible with OBS browser source.
- Smooth animations for StreamBuddy responses.
- The AI must be visually represented as an avatar with a chat bubble, and its appearance (avatar, name, bubble style) should be customizable by the streamer.

## 7. Technical Considerations

- Frontend: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui.
- Backend: NestJS with TypeScript, PostgreSQL, TypeORM.
- AI: OpenAI API integration, cost-optimized usage.
- Real-time: WebSocket connections for chat and overlay updates.
- Database: Local PostgreSQL instance with tables for users, games, chat messages, AI responses, and stream sessions.
- Support for mixed Indonesian/English language processing, including slang and regional dialects.
- Case-insensitive matching for Indonesian text.
- Proper error handling and logging throughout the chat processing pipeline.
- Use React Query for server state management on the frontend.

## 8. Success Metrics

- 85%+ of common questions answered automatically by StreamBuddy.
- Response time under 3 seconds for chat replies.
- Support for top 3 games at launch.
- Cost per stream under $8.
- High user satisfaction (positive feedback from streamers and viewers).
- Smooth operation at high chat volumes (up to 200 messages/minute).

## 9. Open Questions

- Are there any additional games or features to prioritize after the initial launch?
- What is the process for updating or adding new response templates?
- How will feedback from streamers and viewers be collected and incorporated?
- Are there any legal or privacy considerations for storing chat data?
- Should StreamBuddy support additional streaming platforms beyond YouTube and Twitch in the future?
