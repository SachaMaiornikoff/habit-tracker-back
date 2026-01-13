# habit-tracker-back

Backend API for a habit tracking application that allows users to create, manage, and track their daily habits with weekly targets and streak tracking.

## Tech Stack

- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.9
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod

## Prerequisites

- Node.js 22+
- npm

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

> **Important:** Change `JWT_SECRET` to a secure random string in production.

## Running the Application

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── index.ts              # Application entry point
├── controllers/          # Request handlers
├── routes/               # API route definitions
├── middlewares/          # Auth & error handling middleware
├── services/             # Business logic
├── validators/           # Zod validation schemas
├── errors/               # Custom error classes
└── types/                # TypeScript definitions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Migration history
```

## Data Model

### User
- `id` - UUID primary key
- `email` - Unique email address
- `passwordHash` - Bcrypt-hashed password
- `firstName`, `lastName` - User name
- `createdAt` - Registration timestamp

### Habit
- `id` - UUID primary key
- `userId` - Owner reference
- `title` - Habit name
- `color` - Hex color code (#RRGGBB)
- `weeklyTarget` - Target completions per week (1-7)
- `createdAt` - Creation timestamp
- `archivedAt` - Soft delete timestamp (nullable)

### HabitEntry
- `id` - UUID primary key
- `habitId` - Habit reference
- `date` - Entry date (YYYY-MM-DD)
- `completedAt` - Completion timestamp
- Unique constraint on (habitId, date)

## API Endpoints

### Authentication

All endpoints except register/login require the header:
```
Authorization: Bearer <token>
```

#### `POST /auth/register`
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "<sha256-hash>",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** User object + JWT token

#### `POST /auth/login`
Login with existing credentials.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "<sha256-hash>"
}
```

**Response:** User object + JWT token

#### `GET /auth/me`
Get authenticated user profile.

#### `PATCH /auth/me`
Update user profile.

**Body:**
```json
{
  "currentPassword": "<sha256-hash>",
  "email": "new@example.com",
  "password": "<sha256-hash>",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Habits

#### `POST /habits`
Create a new habit.

**Body:**
```json
{
  "title": "Exercise",
  "color": "#FF5733",
  "weeklyTarget": 3
}
```

#### `GET /habits`
Get all habits for the authenticated user.

#### `GET /habits/:id`
Get a specific habit.

#### `PATCH /habits/:id`
Update a habit.

**Body:**
```json
{
  "title": "Updated Title",
  "color": "#00FF00",
  "weeklyTarget": 5,
  "archivedAt": "2026-01-13T00:00:00Z"
}
```

#### `DELETE /habits/:id`
Delete a habit and all its entries.

#### `GET /habits/:id/streak`
Get the current streak count for a habit.

**Response:**
```json
{
  "streak": 5
}
```

### Habit Entries

#### `GET /habit-entries`
Get entries for a habit within a date range.

**Query parameters:**
- `habitId` - UUID of the habit
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

#### `PUT /habit-entries`
Create or delete a habit entry.

**Body:**
```json
{
  "habitId": "<uuid>",
  "date": "2026-01-13",
  "completed": true
}
```

Setting `completed: false` deletes the entry if it exists.

## Error Handling

The API returns structured error responses:

```json
{
  "error": {
    "type": "ValidationError",
    "message": "Description du problème"
  }
}
```

**Error Types:**
- `ValidationError` (400) - Invalid input
- `UnauthorizedError` (401) - Authentication required/failed
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict (e.g., duplicate email)
- `InternalError` (500) - Server error

## License

MIT License - Copyright 2026 SachaMaiornikoff
