# Project Structure & Component Guide

**Last Updated:** April 20, 2026 | **Status:** MVP Complete (70% features implemented)

---

## 🗺 Site Overview (ASCII)

```text
--------------------------------------------------------------------------------
 HCAI Lab Website
--------------------------------------------------------------------------------
 Browser
   |
   v
 Frontend (React + Vite + React Router)  http://localhost:9001
   |
   +-- Public pages
   |     /               Home
   |     /rent           Equipment rentals
   |     /seminars       Seminar listings
   |     /research       Research projects
   |     /screen         Public screen display
   |     /login          Login
   |     /register       Register
   |
   +-- Protected pages (Auth required)
   |     /profile        User profile
   |     /my-rentals     Rental history
   |     /my-seminars    Seminar registrations
   |
   +-- Admin pages (Admin role required)
         /admin/home     Admin dashboard
         /admin/inventory Inventory management
         /admin/seminars  Seminar management
   |
   v
 Backend API (Express + MongoDB)        http://localhost:2169
   |
   +-- /api/v1/auth        Login + registration
   +-- /api/v1/inventory   Equipment CRUD
   +-- /api/v1/seminars    Seminar CRUD + registration
   +-- /api/v1/users       Rentals + user seminar records
   +-- /api/v1/research    Research project CRUD
   +-- /api/v1/researchers Researcher profile CRUD
   |
   +-- Middleware
         auth, validation, error handling, CORS
   |
   v
 MongoDB
   |
   +-- users
   +-- inventory
   +-- seminars
   +-- research
   +-- researchers

 Shared flow:
   AuthProvider -> route guards -> auth headers -> API -> database
```

## 🔧 Backend (Node.js + Express + MongoDB)

### Key Files

**server.js**
- Main entry point for the backend application
- Initializes Express app, connects to MongoDB, sets up CORS
- Defines middleware for JSON parsing and request handling
- Starts server on PORT (default 2169)

**routers/api.v1.router.js**
- Defines all API endpoints (40+ routes)
- Protects endpoints with `requireAdmin` and `requireUser` middleware
- Groups endpoints by feature: auth, inventory, seminars, research, users, rentals

**middleware/auth.js**
- `requireUser()` - Verifies user is logged in (validates x-user-id header)
- `requireAdmin()` - Verifies user has admin role (validates x-user-role header)
- Both attach user info to request object for use in controllers

**controllers/**
- `auth.controller.js` - Login and registration requests
- `inventory.controller.js` - Equipment CRUD operations
- `seminar.controller.js` - Seminar CRUD and retrieval (with pagination support)
- `users.controller.js` - Rentals, seminar registrations, cancellations, withdrawals
- `research.controller.js` - Research project and researcher CRUD (NEW - fully secured)

**services/**
- `auth.service.js` - Authentication business logic (login, registration, password hashing)
- `inventory.service.js` - Equipment database operations
- `seminar.service.js` - Seminar operations with pagination support (getAllSeminars returns {data, pagination})
- `user.service.js` - User operations, rental management, seminar registration/withdrawal
- `research.service.js` - Research project and researcher database operations (NEW)

**model/**
- `users.js` - User schema with rentals array, seminarRegistrations array, role-based access
- `Inventory.js` - Equipment schema with availability tracking
- `Seminar.js` - Seminar schema with title (required), capacity (required, min 1), registeredUsers array, isCurrent flag
- `Research.js` - Research project schema with title, description, tags, researchers array (NEW)
- `Researcher.js` - Researcher profile schema with name, bio, email, research interests (NEW)

**validators/**
- `user.validator.js` - Username, password, email validation (strong password required)
- `inventory.validator.js` - Equipment name, quantity, description validation
- `seminar.validator.js` - Title (required), description, professor, room, time, capacity (required) validation
- `research.validator.js` - Research title, description, tags validation (NEW)
- `validate.js` - Middleware to handle validation errors and return 400 responses

---

## 🎨 Frontend (React 19 + Vite + React Router)

### Key Files

**App.jsx**
- Main application component with 15+ routes
- Public routes: home, login, register, rent, seminars, research, screen
- Protected routes: profile, my-rentals, my-seminars
- Admin routes: admin/home, admin/inventory, admin/seminars

**context/auth-context.jsx**
- Global authentication state (user, role, auth headers)
- `useAuth()` hook for accessing auth state
- Persists login state to localStorage (uid, username, role)
- Provides authHeaders object for authenticated API calls

**utils/api.js**
- `apiRequest(path, options)` - Centralized API call helper
- Handles fetch, error handling, JSON parsing with fallbacks
- Auto-includes auth headers if user logged in
- Used by all pages for backend communication

### Pages (12 total)

| Page | Route | Purpose | Auth Required |
|------|-------|---------|----------------|
| HomePage | `/` | Homepage with featured seminars, news, events | None |
| LoginPage | `/login` | User login form | None |
| RegisterPage | `/register` | Create new account | None |
| ProfilePage | `/profile` | Display current user info with action buttons | User ✅ |
| MyRentalsPage | `/my-rentals` | View user's rental history with cancel option | User ✅ |
| MySeminarsPage | `/my-seminars` | View seminar registrations with withdraw option | User ✅ |
| RentPage | `/rent` | Browse equipment and create rental requests | None |
| SeminarsPage | `/seminars` | Browse all seminars with pagination | None |
| ResearchPage | `/research` | **NEW** - Browse research projects with search/filter | None |
| ScreenPage | `/screen` | Information display for physical screens/kiosks | None |
| AdminHomePage | `/admin/home` | Admin dashboard with shortcuts | Admin ✅ |
| InventoryPage | `/admin/inventory` | Admin equipment CRUD interface | Admin ✅ |
| EditSeminar | `/admin/seminars` | Admin seminar CRUD with title + capacity fields | Admin ✅ |

### Components

**Layout Components**
- `navbar.jsx` - **UPDATED** Navigation bar with consolidated user dropdown (Profile, My Rentals, My Seminars, Admin options, Logout)
- `Footer.jsx` - Footer with contact info and links
- `DataCard.jsx` - **NEW** Reusable wider card layout (1000px max-width) for My Rentals/My Seminars

**UI Components**
- `ButtonLight.jsx` - Reusable light button component
- `Calendar.jsx` - Date picker component
- `CurrentSeminars.jsx` - **UPDATED** Seminar card display with capacity info, register button, "X/Y Booked" display
- `InventoryAdmin.jsx` - Equipment management table
- `News.jsx` - News card display (currently hardcoded)
- `RentDialog.jsx` - Modal dialog for completing equipment rental
- `InfoCard.jsx` - Generic card component for displaying items

---

## 📊 Data Models (Updated April 20)

### User
```
uid: Number (auto-generated, 0 to MAX_SAFE_INTEGER)
username: String (3-60 chars, alphanumeric only)
pwd: String (hashed with bcrypt, never stored plaintext)
email: String (unique, validates email format)
role: "user" | "admin" (default: "user")

rentals: [{
  itemId: ObjectId (ref: InventoryItem),
  dates: [Date] (rental date range),
  createdAt: Date,
  returnedAt: Date | null,
  cancelledAt: Date | null  // NEW - tracks cancellations
}]

seminarRegistrations: [{
  seminarId: ObjectId (ref: Seminar),  // FIXED - was Number, now ObjectId
  registeredAt: Date,
  withdrawnAt: Date | null  // NEW - tracks withdrawals
}]
```

### Inventory
```
name: String (1-120 chars)
description: String (up to 500 chars)
quantity: Number (total items available)
available: Number (currently available for rent)
image: String (URL to item image, optional)
timestamps: {
  createdAt: Date,
  updatedAt: Date
}
```

### Seminar
```
title: String (1-200 chars, REQUIRED - NEW)
description: String (1-1000 chars, required)
professor: String (up to 120 chars)
room: String (location, up to 120 chars)
time: String (date/time string, up to 120 chars)
image: String (optional URL)
isCurrent: Boolean (default: true, filters current/past seminars)
capacity: Number (REQUIRED, default 50, min 1 - NEW)
registeredUsers: [Number] (array of user UIDs - NEW, used for capacity checking)
timestamps: {
  createdAt: Date,
  updatedAt: Date
}
```

### Research (NEW - April 20)
```
title: String (required, up to 200 chars)
description: String (required, up to 1000 chars)
tags: [String] (research keywords/categories)
researchers: [ObjectId] (ref: Researcher, linked researchers)
year: Number (publication/project year, optional)
venue: String (publication venue/conference, optional)
url: String (link to project/paper, optional)
timestamps: {
  createdAt: Date,
  updatedAt: Date
}
```

### Researcher (NEW - April 20)
```
name: String (required)
bio: String (biography/description, optional)
email: String (contact email, optional)
image: String (profile picture URL, optional)
researchInterests: [String] (areas of expertise)
timestamps: {
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

1. **Registration** - User creates new account
   - Frontend sends POST to `/api/v1/auth/register`
   - Backend validates strong password (9+ chars, uppercase, lowercase, number, symbol)
   - Backend hashes password with bcrypt
   - Backend generates random uid
   - Returns user object with uid, username, email, role
   - Frontend stores in auth context + localStorage

2. **Login** - User enters credentials
   - Frontend sends POST to `/api/v1/auth/login`
   - Backend verifies username exists and password hash matches
   - Returns user object (uid, username, email, role)
   - Frontend stores in auth context + localStorage

3. **Protected Requests** - API calls after login
   - Frontend includes auth headers: `x-user-id` and `x-user-role`
   - Backend middleware (`requireUser`, `requireAdmin`) verifies headers
   - Request proceeds or returns 401 (unauthorized) / 403 (forbidden)

4. **Logout** - User clicks logout
   - Frontend clears auth context
   - Frontend clears localStorage
   - User redirected to login page

⚠️ **Security Note:** Currently no session timeout - tokens persist indefinitely in localStorage. This will be fixed with JWT implementation.

---

## 📋 API Endpoints (Updated - 40+ total)

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - New user registration

### Inventory (Equipment)
- `GET /api/v1/inventory` - List all equipment
- `POST /api/v1/inventory` - **[ADMIN]** Create equipment
- `PATCH /api/v1/inventory/:id` - **[ADMIN]** Update equipment
- `DELETE /api/v1/inventory/:id` - **[ADMIN]** Delete equipment

### Seminars
- `GET /api/v1/seminars` - List all seminars (supports `?current=true/false&page=X&limit=Y`)
- `GET /api/v1/seminars/:id` - Get single seminar with capacity info
- `POST /api/v1/seminars` - **[ADMIN]** Create seminar
- `PATCH /api/v1/seminars/:id` - **[ADMIN]** Update seminar (including capacity)
- `DELETE /api/v1/seminars/:id` - **[ADMIN]** Delete seminar

### User Rentals
- `POST /api/v1/rentals` - **[USER]** Create rental request
- `GET /api/v1/users/:uid/rentals` - Get user's rental history
- `DELETE /api/v1/rentals/:rentalIndex` - **[USER]** Cancel rental

### User Seminar Registration
- `POST /api/v1/seminars/:id/register` - **[USER]** Register for seminar
- `GET /api/v1/users/:uid/seminars` - Get user's seminar registrations
- `DELETE /api/v1/seminars/:seminarIndex/unregister` - **[USER]** Withdraw from seminar

### Research (NEW - fully secured with requireAdmin)
- `GET /api/v1/research` - List all research projects
- `GET /api/v1/research/:id` - Get single research project
- `POST /api/v1/research` - **[ADMIN]** Create research project
- `PATCH /api/v1/research/:id` - **[ADMIN]** Update research project
- `DELETE /api/v1/research/:id` - **[ADMIN]** Delete research project

### Researchers (NEW - fully secured with requireAdmin)
- `GET /api/v1/researchers` - List all researchers
- `GET /api/v1/researchers/:id` - Get researcher profile
- `POST /api/v1/researchers` - **[ADMIN]** Create researcher
- `PATCH /api/v1/researchers/:id` - **[ADMIN]** Update researcher
- `DELETE /api/v1/researchers/:id` - **[ADMIN]** Delete researcher

### News
- `GET /api/v1/news` - Fetch news via SerpAPI (placeholder)

**Response Format (All Endpoints):**
- Success: `{ data: {...} }` or `{ message: "...", data: {...} }` (HTTP 200/201)
- List endpoints with pagination: `{ data: [...], pagination: { page, limit, total, totalPages, hasNextPage, hasPrevPage } }`
- Error: `{ message: "error description" }` (HTTP 400/401/403/500)

---

## 🛠️ Common Development Patterns

### Making API Calls
```javascript
try {
  const data = await apiRequest("/api/v1/endpoint", {
    method: "POST",
    headers: authHeaders, // Required for authenticated endpoints
    body: JSON.stringify({ field: "value" }),
  });
  // Handle successful response
} catch (err) {
  setError(err.message); // Display error to user
}
```

### Handling Paginated Responses
```javascript
const response = await apiRequest("/api/v1/seminars?page=1&limit=10");
const seminars = response.data || response;  // Handle both formats
const totalPages = response.pagination?.totalPages;
```

### Using Auth
```javascript
const { user, logout, isAdmin, authHeaders } = useAuth();
if (!user) navigate("/login"); // Redirect if not logged in
if (!isAdmin) navigate("/unauthorized"); // Redirect if not admin
```

### Protecting Routes
```javascript
// Admin-only route
<AdminRoute>
  <AdminPage />
</AdminRoute>

// Logged-in users only
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```

### Confirmation Dialogs
```javascript
if (!window.confirm("Are you sure?")) {
  return; // User cancelled
}
// Proceed with action (delete, cancel, withdraw, etc.)
```

### Handling Partial JSON Responses
```javascript
try {
  const data = await response.json();
} catch (e) {
  // Response body is not JSON - use generic error
  errorMessage = `Error: ${response.status} ${response.statusText}`;
}
```

---

## 📝 Code Comments Guide

- Top of file: Component/file purpose and dependencies
- Complex logic: Explain "why" not just "what"
- Middleware: Explain what protection is being applied
- State management: Document useState initial values and purposes
- API calls: Comment what endpoint is called and why
- Keep comments concise - 1-2 lines max
- Avoid over-commenting obvious code

---

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
npm run dev            # Start dev server on port 2169
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Start Vite dev server on port 5173
```

### Database
```bash
# Seed database with test data
npm run seed:all      # Runs all seed files (users, inventory, seminars, research)
```

---

## 📦 Key Dependencies

**Backend:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `express-validator` - Input validation
- `bcryptjs` - Password hashing

**Frontend:**
- `react` - UI framework
- `vite` - Build tool
- `react-router-dom` - Routing
- `sass` - CSS preprocessor

---

## ✅ Recent Updates (April 19-20, 2026)

- ✅ Research feature fully implemented with search capability
- ✅ Seminar titles now required field (with form support)
- ✅ Seminar capacity limits fully operational
- ✅ Navigation consolidated into single user dropdown
- ✅ Rental cancellation and seminar withdrawal fully working
- ✅ EditSeminar form updated to accept title and capacity
- ✅ API pagination responses properly formatted
- ✅ All CRUD operations secured with appropriate middleware

### Key Files

**server.js**
- Main entry point for the backend application
- Initializes Express app, connects to MongoDB, sets up CORS
- Defines middleware for JSON parsing and request handling
- Starts server on PORT (default 2169)

**routers/api.v1.router.js**
- Defines all API endpoints and their routes
- Uses validators and auth middleware to protect/validate requests
- Groups endpoints by feature: auth, inventory, seminars, users

**middleware/auth.js**
- `requireUser()` - Verifies user is logged in (checks headers)
- `requireAdmin()` - Verifies user has admin role (checks headers)
- Both attach user info to request object for use in controllers

**controllers/**
- `auth.controller.js` - Handles login and registration requests
- `inventory.controller.js` - Handles equipment CRUD operations  
- `users.controller.js` - Handles rentals and seminar registrations

**services/**
- `auth.service.js` - Business logic for authentication (login/register)
- `inventory.service.js` - Database operations for inventory
- `user.service.js` - Database operations for users, rentals, registrations

**model/**
- `users.js` - MongoDB schema for User collection
- `Inventory.js` - MongoDB schema for Inventory collection
- `Seminar.js` - MongoDB schema for Seminar collection

**validators/**
- `user.vlaidator.js` - Input validation rules for username, password, email
- `inventory.validator.js` - Input validation for inventory items
- `seminar.validator.js` - Input validation for seminars
- `validate.js` - Middleware to handle validation errors

---

## 🎨 Frontend (React + Vite + React Router)

### Key Files

**App.jsx**
- Main application component
- Defines all routes (public, protected, admin-only)
- Wraps app with AuthProvider for global auth state

**context/auth-context.jsx**
- Global authentication state management
- `AuthProvider` - Provides auth state to entire app
- `useAuth()` - Hook to access auth state from any component
- Persists login state to localStorage

**utils/api.js**
- Helper function for making API requests to backend
- `apiRequest(path, options)` - Handles fetch, error handling, JSON parsing
- Used by all pages to communicate with backend

### Pages

**pages/login.jsx** - User login form with error display
**pages/RegisterPage.jsx** - New account creation form
**pages/ProfilePage.jsx** - Display current user info and options
**pages/MyRentalsPage.jsx** - Show user's rental history
**pages/MySeminarsPage.jsx** - Show seminars user is registered for
**pages/RentPage.jsx** - Browse equipment and create rental requests
**pages/SeminarsPage.jsx** - Browse all seminars
**pages/InventoryPage.jsx** - Admin page to manage equipment
**pages/EditSeminar.jsx** - Admin page to create/edit seminars
**pages/AdminHomePage.jsx** - Admin dashboard with navigation

### Components

**components/layout/navbar.jsx** - Navigation bar with auth-aware menu
**components/ui/ButtonLight.jsx** - Reusable button component
**components/InfoCard.jsx** - Reusable card component for displaying items
**components/RentDialog.jsx** - Modal for completing equipment rental

---

## 📊 Data Models

### User
- `uid` - Unique user ID (number)
- `username` - Login name (alphanumeric, 3-60 chars)
- `pwd` - Hashed password
- `email` - User email (unique)
- `role` - "user" or "admin"
- `rentals` - Array of rental requests
- `seminarRegistrations` - Array of seminar registrations

### Inventory
- `name` - Equipment name (1-120 chars)
- `quantity` - Total number of items in stock
- `available` - Number available for rent
- `description` - Item details (up to 500 chars)
- `image` - URL to item photo
- `timestamps` - Created/updated dates

### Seminar
- `description` - Seminar details (up to 1000 chars)
- `professor` - Instructor name
- `room` - Location
- `time` - Date/time as string
- `image` - URL to seminar photo
- `isCurrent` - Boolean for filtering current/past
- `timestamps` - Created/updated dates

---

## 🔐 Authentication Flow

1. **Login** - User enters credentials
   - Frontend sends POST to `/api/v1/auth/login`
   - Backend verifies username and password hash
   - Returns user object (uid, username, email, role)
   - Frontend stores user in auth context + localStorage

2. **Protected Requests** - API calls after login
   - Frontend includes auth headers: `x-user-id` and `x-user-role`
   - Backend middleware verifies headers before processing
   - Request proceeds or returns 401/403 error

3. **Logout** - User clicks logout
   - Frontend clears auth context
   - Frontend clears localStorage
   - User redirected to login page

---

## 🛠️ Common Development Patterns

### Making API Calls
```javascript
try {
  const data = await apiRequest("/api/v1/endpoint", {
    method: "POST",
    headers: authHeaders, // Needed for authenticated endpoints
    body: JSON.stringify({ field: "value" }),
  });
} catch (err) {
  setError(err.message); // Display error to user
}
```

### Using Auth
```javascript
const { user, logout, isAdmin, authHeaders } = useAuth();
if (!user) navigate("/login"); // Redirect if not logged in
```

### Protecting Routes
```javascript
// Admin-only route
<AdminRoute>
  <AdminPage />
</AdminRoute>

// Logged-in users only
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>
```

---

## 📝 Code Comments Guide

- `/` - Main component/file purpose
- `//` - One-line explanations throughout code
- Comments on complex logic and important validation checks
- Comments on middleware and route protection
- Comments on state management (useState, useAuth)
- No multi-line comment blocks (keep it simple)
