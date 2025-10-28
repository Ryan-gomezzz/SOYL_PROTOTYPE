# SOYL Studio Bot - MCQ Chatbot Implementation

## Overview

The SOYL Studio Bot is a fast, friendly MCQ-driven onboarding chatbot that converts visitors into a mini design brief. It provides print-ready suggestions and product recommendations through a simple multiple-choice interface.

## Features

- **MCQ Interface**: All interactions are multiple-choice questions with keyboard navigation
- **Auto-open**: Automatically opens after 8 seconds on first visit
- **Session Persistence**: Saves progress in localStorage
- **Accessibility**: Full keyboard navigation and screen reader support
- **Analytics**: Tracks user interactions and completion rates
- **Responsive Design**: Works on all device sizes
- **Error Handling**: Graceful error handling with retry options

## Components

### ChatbotWidget.tsx
Main React component that renders the chatbot interface.

**Props:**
- `autoOpenDelay?: number` - Delay before auto-opening (default: 8000ms)
- `onComplete?: (data: any) => void` - Callback when flow completes

**Key Features:**
- Progress tracking with visual progress bar
- Keyboard navigation (1-4, A-D keys, Escape to close)
- Screen reader support with ARIA labels
- Rate limiting to prevent rapid clicks
- Analytics event tracking

### chatbotData.ts
Contains the question tree and answer mappings.

**Exports:**
- `chatbotQuestions` - Array of question objects
- `chatbotEndpoints` - Endpoint configurations
- `answerLabels` - Answer label mappings for summary generation

### chatbotUtils.ts
Utility functions for the chatbot.

**Functions:**
- `generateSummary()` - Creates a summary from user answers
- `saveChatbotResponse()` - Sends data to backend API
- `generateVisitorId()` - Creates/retrieves visitor ID
- `trackChatbotEvent()` - Analytics event tracking
- `getUTMParameters()` - Extracts UTM parameters

## Question Flow

1. **Q1**: Welcome/consent to start
2. **Q2**: Story type (Travel, Milestone, Inside joke, Personal brand)
3. **Q3**: Product selection (T-shirt, Hoodie, Tote, Mug)
4. **Q4**: Design vibe (Minimal, Photographic, Illustrative, Premium)
5. **Q5**: Color family (Muted neutrals, Bold & vibrant, Pastels, Black & White)
6. **Q6**: Placement preference (Center chest, Left chest, Full-front, Back print)
7. **Q7**: Production style/Tier (Express, Story, Signature)

## API Integration

### Backend Endpoint
`POST /api/chatbot-responses`

**Request Body:**
```json
{
  "sessionId": "uuid",
  "startedAt": "ISO8601",
  "answers": [
    {
      "questionId": "Q2",
      "answerKey": "A",
      "answerLabel": "Travel memory"
    }
  ],
  "summary": "Travel memory on a T-shirt, Photographic collage, Bold & vibrant, Full-front print. Tier: Story.",
  "email": "user@example.com",
  "source": "chatbot",
  "utm": "utm_source=google&utm_medium=cpc",
  "visitorId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chatbot response saved successfully",
  "sessionId": "uuid"
}
```

## Analytics Events

The chatbot tracks the following events:

- `chat_open` - When chatbot is opened/closed
- `question_answered` - When a question is answered
- `flow_completed` - When the flow is completed
- `email_provided` - When user provides email

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with number/letter keys
- **Screen Reader Support**: ARIA labels and roles
- **High Contrast**: Meets WCAG guidelines
- **Focus Management**: Proper focus handling
- **Progress Indication**: Visual and audio progress feedback

## Usage

### Basic Usage
```tsx
import { ChatbotWidget } from './components/Chatbot';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatbotWidget />
    </div>
  );
}
```

### With Custom Configuration
```tsx
<ChatbotWidget 
  autoOpenDelay={5000}
  onComplete={(data) => {
    console.log('Chatbot completed:', data);
    // Handle completion
  }}
/>
```

### Manual Trigger
```tsx
import { ChatbotWidget } from './components/Chatbot';

function Hero() {
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowChatbot(true)}>
        Design with AI
      </button>
      
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <ChatbotWidget 
            autoOpenDelay={0}
            onComplete={() => setShowChatbot(false)}
          />
        </div>
      )}
    </>
  );
}
```

## Styling

The chatbot uses Tailwind CSS classes and follows the SOYL design system:

- **Colors**: `soyl-gold`, `soyl-black`, `soyl-white`
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design approach

## Local Storage Keys

- `soyl_chatbot_visited` - Tracks if user has seen chatbot
- `soyl_chatbot_session` - Saves current session state
- `soyl_visitor_id` - Unique visitor identifier

## Error Handling

- Network errors show inline error messages
- Failed submissions allow retry
- Invalid responses are handled gracefully
- Rate limiting prevents spam

## Future Enhancements

- Branching logic based on answers
- Template recommendations
- Voice input support
- A/B testing for different tones
- Mock preview generation
- Advanced analytics dashboard

## Development

### Running Locally
1. Start the development server: `pnpm dev`
2. The chatbot will be available on all pages
3. Check browser console for analytics events

### Testing
- Test keyboard navigation
- Verify screen reader compatibility
- Check mobile responsiveness
- Validate API integration

### Deployment
The chatbot is automatically included in the main app build and will be available in production.
