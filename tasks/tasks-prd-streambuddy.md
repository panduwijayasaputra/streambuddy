## Relevant Files

- `apps/backend/src/chat/chat.service.ts` - Handles real-time chat monitoring, filtering, and database storage logic. (Now uses MentionService for mention detection)
- `apps/backend/src/chat/chat-message.entity.ts` - TypeORM entity for the chat_messages table.
- `apps/backend/src/chat/chat.service.test.ts` - Unit tests for chat monitoring/filtering logic.
- `apps/backend/src/mention/mention.service.ts` - Detects and processes @StreamBuddy mentions. (Now supports Indonesian/English and slang variations)
- `apps/backend/src/mention/mention.service.test.ts` - Unit tests for mention detection.
- `apps/backend/src/mention/mention.service.test.ts` - Unit tests for mention detection and response triggering.
- `apps/backend/src/qa/qa-engine.service.ts` - Answers game and stream context questions using templates/AI.
- `apps/backend/src/qa/qa-engine.service.test.ts` - Unit tests for Q&A engine and response logic.
- `apps/backend/src/analytics/analytics.service.ts` - Collects and provides streamer analytics and activity data.
- `apps/backend/src/analytics/analytics.service.test.ts` - Unit tests for analytics service.
- `apps/frontend/components/Overlay/StreamBuddyOverlay.tsx` - Stream overlay component for displaying StreamBuddy responses and avatar.
- `apps/frontend/components/Overlay/StreamBuddyOverlay.test.tsx` - Unit tests for overlay component.
- `apps/frontend/components/Settings/PersonalizationPanel.tsx` - UI for customizing StreamBuddy's name, avatar, and chat bubble.
- `apps/frontend/components/Settings/PersonalizationPanel.test.tsx` - Unit tests for personalization panel.
- `packages/shared/types/streambuddy.ts` - Shared types/interfaces for StreamBuddy features.
- `packages/shared/types/streambuddy.test.ts` - Unit tests for shared types (if needed).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Implement Real-Time Chat Monitoring and Filtering

  - [x] 1.1 Design and implement chat message ingestion pipeline (WebSocket, REST, or both)
  - [x] 1.2 Filter and preprocess incoming chat messages (remove spam, irrelevant messages)
  - [x] 1.3 Store chat messages in the database (`chat_messages` table)
  - [x] 1.4 Write unit tests for chat monitoring and filtering logic

- [ ] 2.0 Develop StreamBuddy Mention Detection and Response System

  - [x] 2.1 Implement logic to detect @StreamBuddy (or custom name) mentions in chat
  - [x] 2.2 Ensure mention detection supports Indonesian/English and slang variations
  - [x] 2.3 Integrate mention detection with chat monitoring pipeline
  - [x] 2.4 Write unit tests for mention detection and response triggering

- [x] 3.0 Build Game and Stream Context Q&A Engine

  - [x] 3.1 Implement template-based responses for common game questions (top 3 games)
  - [x] 3.2 Integrate OpenAI API for fallback/complex questions (cost-optimized)
  - [x] 3.3 Implement logic to answer stream context questions (duration, current game, viewer count)
  - [x] 3.4 Ensure responses use proper Indonesian/English and gaming slang
  - [x] 3.5 Write unit tests for Q&A engine and response logic

- [ ] 4.0 Create Streamer Analytics and Activity Dashboard

  - [ ] 4.1 Design backend analytics service to aggregate chat engagement and StreamBuddy activity
  - [ ] 4.2 Implement API endpoints for analytics data retrieval
  - [ ] 4.3 Build frontend dashboard to display analytics to streamers
  - [ ] 4.4 Write unit tests for analytics backend and frontend components

- [ ] 5.0 Integrate StreamBuddy Overlay and Personalization Features
  - [ ] 5.1 Develop overlay component for OBS/browser source (avatar, chat bubble, smooth animations)
  - [ ] 5.2 Implement UI for streamer personalization (name, avatar, chat bubble style)
  - [ ] 5.3 Ensure overlay supports StreamBuddy brand colors, light/dark themes, and shadcn/ui components
  - [ ] 5.4 Integrate overlay with real-time chat and Q&A responses
  - [ ] 5.5 Write unit tests for overlay and personalization features
