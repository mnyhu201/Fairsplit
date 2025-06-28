# Fairsplit Node.js Backend

A Node.js backend for the Fairsplit application using Express.js and Supabase for authentication and database management.

## Features

- **Supabase Auth Integration**: Built-in authentication with email/password
- **User Management**: Complete user CRUD operations with profile management
- **Group Management**: Create, manage, and organize users into groups
- **TypeScript**: Full TypeScript support with strict typing
- **Security**: Helmet, CORS, rate limiting, and JWT validation
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Fill in your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database/schema.sql
-- Copy and paste the contents of database/groups-schema.sql
```

### 4. Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/reset-password` | Request password reset |
| POST | `/api/auth/update-password` | Update password (authenticated) |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | No |
| GET | `/api/users/:id` | Get user by ID | No |
| GET | `/api/users/username/:username` | Get user by username | No |
| GET | `/api/users/group/:groupId` | Get users by group | No |
| GET | `/api/users/profile/me` | Get current user profile | Yes |
| POST | `/api/users/register` | Create user profile | Yes |
| PUT | `/api/users/:id` | Update user | Yes |
| PUT | `/api/users/:id/balance` | Update user balance | No |
| PUT | `/api/users/:id/add-balance` | Add to user balance | No |
| DELETE | `/api/users/:id` | Delete user (soft delete) | Yes |

### Groups

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/groups` | Get all groups | No |
| GET | `/api/groups/active/:status` | Get groups by active status | No |
| GET | `/api/groups/my-groups` | Get current user's groups | Yes |
| GET | `/api/groups/:id` | Get group by ID | Yes |
| GET | `/api/groups/:id/users` | Get group with users | Yes |
| POST | `/api/groups` | Create new group | Yes |
| PUT | `/api/groups/:id` | Update group | Yes |
| DELETE | `/api/groups/:id` | Delete group | Yes |
| POST | `/api/groups/:groupId/users/:userId` | Add user to group | Yes |
| DELETE | `/api/groups/:groupId/users/:userId` | Remove user from group | Yes |

## Authentication Flow

### 1. User Registration

```javascript
// Frontend registration
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    username: 'username',
    fullname: 'Full Name'
  })
});

const { user, session } = await response.json();
// Store session.access_token for authenticated requests
```

### 2. User Login

```javascript
// Frontend login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { user, session } = await response.json();
// Store session.access_token for authenticated requests
```

### 3. Authenticated Requests

```javascript
// Frontend authenticated request
const response = await fetch('/api/users/profile/me', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
});
```

## Database Schema

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    fullname VARCHAR(100),
    amount DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Groups Table

```sql
CREATE TABLE public.groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group-User junction table for many-to-many relationship
CREATE TABLE public.group_user (
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);
```

## Key Differences from Spring Boot Version

1. **Authentication**: Uses Supabase Auth instead of custom password storage
2. **User ID**: Uses UUID from Supabase Auth instead of auto-incrementing Long
3. **Password Storage**: No password field in users table (handled by Supabase)
4. **Security**: Row Level Security (RLS) policies for data protection
5. **Token Management**: JWT tokens managed by Supabase
6. **Group Management**: Enhanced group functionality with RLS policies

## Development

### Project Structure

```
src/
├── config/
│   └── supabase.ts          # Supabase client configuration
├── controllers/
│   ├── userController.ts    # User HTTP controllers
│   └── groupController.ts   # Group HTTP controllers
├── middleware/
│   └── auth.ts             # Authentication middleware
├── routes/
│   ├── authRoutes.ts       # Authentication routes
│   ├── userRoutes.ts       # User routes
│   └── groupRoutes.ts      # Group routes
├── services/
│   ├── userService.ts      # User business logic
│   └── groupService.ts     # Group business logic
├── types/
│   ├── user.ts             # User TypeScript interfaces
│   └── group.ts            # Group TypeScript interfaces
└── index.ts                # Main application file
```

### Adding New Features

1. Create TypeScript interfaces in `src/types/`
2. Implement business logic in `src/services/`
3. Create HTTP controllers in `src/controllers/`
4. Define routes in `src/routes/`
5. Add database schema in `database/`
6. Update main `index.ts` with new routes

## Testing

### Run Group Tests

```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the group tests
node tests/test-groups.js
```

### Test Coverage

The test suite covers:
- Group creation, reading, updating, and deletion
- Adding and removing users from groups
- Group membership management
- Authentication and authorization
- Error handling

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request data validation and sanitization
- **Error Handling**: Secure error responses without sensitive data exposure

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Ensure environment variables are correctly set
2. **CORS Errors**: Check CORS_ORIGIN configuration
3. **Authentication**: Verify JWT token format and expiration
4. **Database**: Ensure RLS policies are correctly configured

### Logs

Check console output for detailed error messages and debugging information. 