# Vectra Backend API Requirements

This document lists all frontend features that require backend API endpoints.

---

## 1. Authentication & User Management

### Current State
- Using mock data and AsyncStorage for local storage
- No actual server authentication

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login with email/password |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout (invalidate token) |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/verify-email` | POST | Verify email address |

### Request/Response Examples

```json
// POST /api/auth/login
Request: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "isStudentEmail": true
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

## 2. User Profile Management

### Current State
- Profile data stored in AsyncStorage
- Universities/faculties/departments from mock data

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get current user profile |
| `/api/profile` | PUT | Update user profile |
| `/api/profile/photo` | POST | Upload profile photo |
| `/api/profile/onboarding` | POST | Complete onboarding |
| `/api/universities` | GET | List all universities |
| `/api/universities/:id/faculties` | GET | Get faculties for a university |
| `/api/faculties/:id/departments` | GET | Get departments for a faculty |
| `/api/departments/:id/courses` | GET | Get courses for a department and level |

### Request/Response Examples

```json
// PUT /api/profile
Request: {
  "displayName": "John Doe",
  "universityId": "uni_1",
  "facultyId": "fac_1",
  "departmentId": "dept_1",
  "level": "300",
  "photoUrl": "https://..."
}
```

---

## 3. Courses & Past Questions

### Current State
- Using MOCK_QUESTIONS and MOCK_COURSES from constants
- No real data fetching

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List courses (with filters) |
| `/api/courses/:code` | GET | Get course details |
| `/api/courses/:code/questions` | GET | Get past questions for a course |
| `/api/questions/:id` | GET | Get question details with images |
| `/api/questions/:id/solve` | POST | AI-powered question solving |
| `/api/courses/browse` | GET | Browse all available courses |
| `/api/courses/search` | GET | Search courses by name/code |

### Query Parameters

```
GET /api/courses/:code/questions?session=2023/2024&type=Exam&page=1&limit=20
```

---

## 4. Textbooks & Resources

### Current State
- Using MOCK_TEXTBOOKS from constants
- No actual file serving

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses/:code/textbooks` | GET | Get textbooks for a course |
| `/api/textbooks/:id` | GET | Get textbook details |
| `/api/textbooks/:id/download` | GET | Download textbook PDF |
| `/api/resources/upload` | POST | Upload a resource (admin) |

---

## 5. Lecture Recording & Processing

### Current State
- Simulated recording interface
- No actual audio capture or AI processing

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lectures` | GET | List user's recorded lectures |
| `/api/lectures` | POST | Create new lecture record |
| `/api/lectures/:id` | GET | Get lecture details |
| `/api/lectures/:id` | PUT | Update lecture details |
| `/api/lectures/:id` | DELETE | Delete a lecture |
| `/api/lectures/:id/upload` | POST | Upload audio file |
| `/api/lectures/:id/photos` | POST | Upload lecture photos |
| `/api/lectures/:id/process` | POST | Trigger AI processing |
| `/api/lectures/:id/status` | GET | Get processing status |
| `/api/lectures/:id/transcript` | GET | Get transcription |
| `/api/lectures/:id/notes` | GET | Get AI-generated notes |
| `/api/lectures/:id/summary` | GET | Get AI summary |

### Processing Pipeline

1. User uploads audio file
2. Backend transcribes audio (Whisper API)
3. AI generates summary and notes (GPT-4/Claude)
4. Results stored and returned to client

### Request Example

```json
// POST /api/lectures
Request: {
  "courseCode": "CSC301",
  "courseName": "Data Structures",
  "topic": "Binary Trees",
  "lecturer": "Dr. Smith"
}

// POST /api/lectures/:id/upload
Content-Type: multipart/form-data
Body: audio file (m4a, mp3, wav)
```

---

## 6. AI Study Assistant

### Current State
- Using mock AI_RESPONSES
- No actual AI integration

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Send message to AI assistant |
| `/api/ai/summarize` | POST | Summarize content |
| `/api/ai/explain` | POST | Explain a concept |
| `/api/ai/quiz` | POST | Generate practice quiz |
| `/api/ai/solve` | POST | Solve a question |
| `/api/ai/flashcards` | POST | Generate flashcards |

### Request/Response Examples

```json
// POST /api/ai/chat
Request: {
  "lectureId": "lec_123",  // Optional context
  "courseCode": "CSC301",   // Optional context
  "message": "Explain binary tree traversal"
}
Response: {
  "response": "Binary tree traversal...",
  "suggestedFollowups": [
    "What is the time complexity?",
    "Show me an example"
  ]
}
```

---

## 7. Sharing System

### Current State
- Components created but no backend
- Share codes are simulated

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/shares` | POST | Create a new share |
| `/api/shares` | GET | Get user's shares |
| `/api/shares/:id` | DELETE | Revoke a share |
| `/api/shares/redeem` | POST | Redeem a share code |
| `/api/shares/shared-with-me` | GET | Get content shared with user |

### Request/Response Examples

```json
// POST /api/shares
Request: {
  "lectureId": "lec_123",
  "method": "code",  // or "link"
  "expiryDays": 7
}
Response: {
  "id": "share_456",
  "code": "ABC123",      // if method is "code"
  "link": "https://...", // if method is "link"
  "expiresAt": "2024-02-10T00:00:00Z"
}

// POST /api/shares/redeem
Request: {
  "code": "ABC123"
}
Response: {
  "success": true,
  "lecture": {
    "id": "lec_123",
    "title": "Introduction to ML",
    "course": "CSC301"
  }
}
```

---

## 8. Notes & Notebooks

### Current State
- Notes stored locally in AsyncStorage
- No cloud sync

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes` | GET | Get all user notes |
| `/api/notes` | POST | Create a note |
| `/api/notes/:id` | GET | Get a specific note |
| `/api/notes/:id` | PUT | Update a note |
| `/api/notes/:id` | DELETE | Delete a note |
| `/api/notes/sync` | POST | Sync local notes with server |
| `/api/notes/course/:code` | GET | Get notes for a course |

---

## 9. Notifications

### Current State
- Settings stored locally
- No actual push notifications

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/settings` | GET | Get notification preferences |
| `/api/notifications/settings` | PUT | Update notification preferences |
| `/api/notifications/register` | POST | Register device for push |
| `/api/notifications` | GET | Get user notifications |
| `/api/notifications/:id/read` | POST | Mark notification as read |

### Push Notification Integration

- Expo Push Notifications service
- FCM (Firebase Cloud Messaging) for Android
- APNs for iOS

---

## 10. Analytics & Activity

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/activity/study-time` | POST | Log study session |
| `/api/activity/stats` | GET | Get study statistics |
| `/api/activity/streak` | GET | Get study streak data |

---

## 11. Downloads & Offline Content

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/downloads/queue` | POST | Queue content for download |
| `/api/downloads/status` | GET | Get download status |
| `/api/downloads/:id/cancel` | DELETE | Cancel a download |

---

## Technology Recommendations

### Backend Stack
- **Runtime**: Node.js with Express or Fastify
- **Database**: PostgreSQL for structured data
- **Cache**: Redis for sessions and caching
- **Storage**: AWS S3 or Cloudinary for files
- **AI Services**:
  - OpenAI API (GPT-4) for text generation
  - OpenAI Whisper API for audio transcription
  - Alternatively: Anthropic Claude API

### Authentication
- JWT tokens with refresh mechanism
- Optional: OAuth2 for Google/Apple login

### File Processing
- Audio transcription: Whisper API or AssemblyAI
- PDF processing: pdf-parse, pdf-lib
- Image processing: Sharp

### Real-time Features (Optional)
- WebSocket for live updates
- Socket.io or Pusher for notifications

---

## API Security Requirements

1. **Authentication**: All endpoints except auth should require valid JWT
2. **Rate Limiting**: Implement rate limits especially on AI endpoints
3. **Input Validation**: Validate all request bodies
4. **CORS**: Configure for mobile app origins
5. **HTTPS**: All production traffic must be encrypted
6. **File Upload**: Validate file types and sizes

---

## Database Schema (Suggested)

### Core Tables
- `users` - User accounts
- `profiles` - User profiles and preferences
- `universities` - Universities list
- `faculties` - Faculties per university
- `departments` - Departments per faculty
- `courses` - Courses per department
- `questions` - Past questions
- `textbooks` - Textbook references
- `lectures` - Recorded lectures
- `notes` - User notes
- `shares` - Shared content
- `notifications` - User notifications

### Relationships
- User has one Profile
- Profile belongs to University -> Faculty -> Department
- Department has many Courses
- Course has many Questions and Textbooks
- User has many Lectures, Notes, Shares
