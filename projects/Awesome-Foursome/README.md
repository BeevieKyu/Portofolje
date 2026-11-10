# HCAI Lab Website

Full-stack web application for the Human-Centered AI Laboratory at NTNU Gjøvik. Features equipment inventory management with rental tracking, seminar scheduling with capacity limits, and research project discovery. **Status:** MVP Complete (70% core features implemented, ready for user testing).

**Last Updated:** April 20, 2026 | **Version:** 3.0 (Production-ready for testing, needs security hardening)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (v8.0+)
- Docker & Docker Compose (optional)

### Local Setup

#### Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration
npm start
```

Backend runs on `http://localhost:2169` by default.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:9001` by default (Vite dev server).

### Docker Setup

```bash
docker-compose up
```

This starts:
- MongoDB: `localhost:27017`
- Backend: `localhost:2169`
- Frontend: `localhost:9001`

---

## 📋 Features

### ✅ Fully Implemented

**Public Pages**
- **Home** (`/`) - Lab overview with featured seminars
- **Equipment Rent** (`/rent`) - Browse equipment with real availability tracking
- **Seminars** (`/seminars`) - View current/past seminars with pagination
- **Research** (`/research`) - **NEW** Browse research projects with search/filter capability
- **Screen Display** (`/screen`) - Optimized display for physical screens/kiosks

**User Features (After Login)**
- **Profile** (`/profile`) - Account details with action links
- **My Rentals** (`/my-rentals`) - Equipment rental history with cancellation options
- **My Seminars** (`/my-seminars`) - Registered seminars with withdrawal options

**Admin Features**
- **Inventory Management** (`/admin/inventory`) - Create/edit/delete equipment
- **Seminar Management** (`/admin/seminars`) - Create/edit/delete seminars with capacity fields
- **Research Management** (`/admin/research`) - **NEW** Create/manage research projects

**Core Functionality**
- ✅ User registration with strong password validation
- ✅ User login with persistent sessions
- ✅ Seminar capacity limits (prevents overbooking)
- ✅ Equipment rental booking with user tracking
- ✅ Rental cancellation with confirmation dialog
- ✅ Seminar registration with capacity checking
- ✅ Seminar withdrawal with confirmation dialog
- ✅ Research project browsing with live search/filter
- ✅ Researcher profile display
- ✅ Pagination on all list endpoints (10-100 items per page)
- ✅ Role-based access control (admin/user)
- ✅ Responsive UI (desktop & mobile optimized)

### 🟡 Partially Implemented (Not Blocking)
- Email notifications (no email service integrated yet)
- Rental approval workflow (auto-approves currently)
- User profile editing (can't edit account details yet)

### ❌ Not Yet Implemented
- Session timeout (tokens persist indefinitely in localStorage)
- HTTPS/TLS encryption
- CSRF protection
- Rate limiting on auth endpoints
- Admin analytics dashboard

---

## 🔐 Test Credentials

Use these accounts to demo the application:

**Regular User:**
- Username: `student01`
- Password: `TestPass123`
- Email: `student01@ntnu.no`

**Admin User:**
- Username: `admin`
- Password: `AdminPass123`
- Email: `admin@ntnu.no`

**How to create test accounts:**
1. Go to `/register`
2. Fill in username, email, and password (min 8 chars)
3. Click Register
4. Go to `/login` and use your new credentials

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Inventory (Equipment)
- `GET /api/v1/inventory` - List all equipment
- `POST /api/v1/inventory` - Create item (admin only)
- `PATCH /api/v1/inventory/:id` - Update item (admin only)
- `DELETE /api/v1/inventory/:id` - Delete item (admin only)

### Seminars
- `GET /api/v1/seminars` - List seminars (supports `?current=true/false&page=X&limit=Y`)
- `GET /api/v1/seminars/:id` - Get single seminar with capacity info
- `POST /api/v1/seminars` - Create seminar (admin only)
- `PATCH /api/v1/seminars/:id` - Update seminar (admin only)
- `DELETE /api/v1/seminars/:id` - Delete seminar (admin only)

### User Rentals
- `POST /api/v1/rentals` - Create rental request
- `GET /api/v1/users/:uid/rentals` - Get user's rental history
- `DELETE /api/v1/rentals/:rentalIndex` - **NEW** Cancel rental

### Seminar Registration
- `POST /api/v1/seminars/:id/register` - Register for seminar
- `GET /api/v1/users/:uid/seminars` - Get user's seminar registrations
- `DELETE /api/v1/seminars/:seminarIndex/unregister` - **NEW** Withdraw from seminar

### Research (NEW - Fully Implemented)
- `GET /api/v1/research` - List all research projects
- `GET /api/v1/research/:id` - Get single research project
- `POST /api/v1/research` - Create research project (admin only)
- `PATCH /api/v1/research/:id` - Update research project (admin only)
- `DELETE /api/v1/research/:id` - Delete research project (admin only)

### Researchers (NEW - Fully Implemented)
- `GET /api/v1/researchers` - List all researchers
- `GET /api/v1/researchers/:id` - Get researcher profile
- `POST /api/v1/researchers` - Create researcher (admin only)
- `PATCH /api/v1/researchers/:id` - Update researcher (admin only)
- `DELETE /api/v1/researchers/:id` - Delete researcher (admin only)

---

## 📁 Project Structure

```
backend/
├── controllers/        # Request handlers
├── models/            # MongoDB schemas
├── services/          # Business logic
├── middleware/        # Auth & validation
├── routers/           # Route definitions
├── validators/        # Input validation
├── utils/             # Helpers (hashing, etc)
└── server.js          # Express app setup

frontend/
├── pages/             # Full-page components
├── components/        # Reusable UI components
├── context/           # Auth state management
├── utils/             # API request helper
├── styles/            # SCSS stylesheets
└── main.jsx           # React entry point
```

---

## 🧪 Testing Workflow

1. **Register a new account**
   - Go to `/register`
   - Fill in username, email, password
   - You'll be redirected to login

2. **Login**
   - Use your credentials to log in
   - You'll be redirected to home page

3. **Browse Equipment**
   - Go to `/rent` to see available items
   - Try creating a rental request

4. **Admin Panel**
   - Login with admin credentials
   - Go to `/admin/home`
   - Manage inventory and seminars

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Verify MongoDB is running: `mongod` or `docker-compose up mongo`
- Check connection string in `.env`

### "Frontend can't reach backend"
- Verify backend is running on port 2169
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend `server.js`

### "Port already in use"
- Kill process: `lsof -i :2169` then `kill <PID>`
- Or change PORT in `.env`

---

## 📅 Development Progress (April 20, 2026)

### ✅ Implemented & Tested
- ✅ User authentication (register/login)
- ✅ User account management
- ✅ Equipment inventory CRUD with availability tracking
- ✅ Equipment rental requests with user tracking
- ✅ **NEW** Rental cancellation with confirmation
- ✅ Seminar scheduling and management
- ✅ **NEW** Seminar capacity limits (prevents overbooking)
- ✅ Seminar registration with capacity validation
- ✅ **NEW** Seminar withdrawal with confirmation
- ✅ **NEW** Research project management (full CRUD)
- ✅ **NEW** Researcher profile management (full CRUD)
- ✅ **NEW** Research search/filter by keywords
- ✅ Pagination on all list endpoints
- ✅ Role-based access control (admin/user)
- ✅ Responsive UI design
- ✅ Database persistence with MongoDB

### 🟡 In Progress / Partial
- 🟡 Rental approval workflow (auto-approves currently)
- 🟡 User profile editing (UI exists, backend endpoint missing)
- 🟡 Email notifications (placeholder only)
- 🟡 Analytics dashboard (planned)

### ❌ Planned for Next Phase
- ❌ Session timeout with JWT (currently infinite lifetime)
- ❌ HTTPS/TLS encryption configuration
- ❌ CSRF token protection
- ❌ Rate limiting on auth endpoints
- ❌ Researcher self-service portal
- ❌ Admin approval queue interface
- ❌ Automated seminar reminders

### 📊 Completion Rate
- **Core Features:** 100% ✅
- **Research Feature:** 100% ✅
- **Seminar Scheduling:** 100% ✅
- **Equipment Rental:** 95% (missing approval workflow)
- **Security:** 40% (password hashing working, needs session timeout + HTTPS)
- **Accessibility:** 20% (needs WCAG compliance work)
- **Overall:** **70% of planned features**

---

## ⚠️ Known Limitations (Pre-Production)

### Security
- **No Session Timeout:** Auth tokens persist indefinitely in localStorage. In production, implement JWT with 30-minute expiration.
- **No HTTPS:** API runs over HTTP. Production deployment requires TLS/SSL certificate and reverse proxy.
- **No CSRF Protection:** State-changing requests unprotected. Add CSRF middleware before production.
- **No Rate Limiting:** Login/register endpoints vulnerable to brute force. Add rate limiting middleware.

### Features
- **Rentals Auto-Approved:** No admin verification step. Currently all rental requests auto-approve immediately.
- **No User Profile Editing:** Users can't change password or email after registration. Backend endpoint needed.
- **No Email Notifications:** No confirmation or reminder emails sent. Requires email service integration.
- **Hardcoded Placeholder Content:** News section and info board use static content.

### Testing
- No automated tests (unit/integration). Manual testing only.
- No load/performance testing. Not validated for concurrent users.
- No accessibility audit. WCAG compliance not certified.

### Roadmap to Production
1. Implement session timeout with JWT (~3-4 days)
2. Add HTTPS/TLS configuration (~1-2 days)
3. Add rate limiting and CSRF protection (~2-3 days)
4. Complete security hardening (~1 week)
5. Write test coverage target 80% (~2 weeks)
6. Accessibility audit and fixes (~2-3 days)
7. Deploy and monitor (~1 week)

**Estimated time to production:** 4-6 weeks from April 20

---

## 📖 Documentation

- **PROJECT_GUIDE.md** - Detailed architecture, file structure, and development patterns
- **GAP_ANALYSIS.md** - Comprehensive feature gaps, security assessment, and roadmap
- **TESTING.md** - Test scenarios and manual testing procedures

---

## 🔨 Tech Stack

- **Frontend:** React 19, Vite, React Router, SCSS
- **Backend:** Node.js, Express.js, MongoDB/Mongoose
- **Authentication:** Custom auth (currently using localStorage + headers; JWT implementation planned)
- **Deployment:** Docker, Docker Compose

---

## 📞 Support & Contact

For issues, questions, or to contribute, please refer to the project documentation or contact NTNU HCAI Lab.

**Project Status:** MVP Testing Phase (70% complete)  
**Last Updated:** April 20, 2026  
**Next Review:** May 4, 2026 (after user testing feedback)

