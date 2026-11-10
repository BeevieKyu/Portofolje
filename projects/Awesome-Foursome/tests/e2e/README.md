# E2E Tests

End-to-end tests for the HCAI Lab website using Puppeteer and Node's built-in test runner.

## Setup

### Prerequisites
- Backend and Frontend dependencies installed (`npm install` in both directories)
- `.env` file configured in backend with database connection
- Docker (for running backend with compose) OR Node.js for running server directly

### Installation

Puppeteer is already installed in the backend `package.json` as a devDependency.

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

This will:
1. Start the backend server
2. Seed the database with test data
3. Start the frontend dev server
4. Run all test suites
5. Clean up (stop servers)

### Run Individual Test File
```bash
node --test tests/e2e/scenario1.test.js
```

Note: Manual test runs require backend and frontend servers already running.

## Test Suites

### Scenario 1: User Registration → Seminar Discovery → Seminar Registration
**File**: `scenario1.test.js`

Tests the complete user journey from creating an account to registering for a seminar.

#### Test Categories:

**Registration - Positive Cases**
- ✅ Successfully register with valid credentials (standard case)
- ✅ Register with username containing numbers and underscores  
- ✅ Successfully login after registration

**Registration - Negative Cases**
- ✅ Reject registration with invalid email format
- ✅ Reject registration with duplicate username
- ✅ Reject login with incorrect password
- ✅ Reject login with non-existent username

**Seminar Discovery & Registration - Positive Cases**
- ✅ Browse available seminars after login
- ✅ Register for an available seminar
- ✅ View registered seminars in "My Seminars" page

**Boundary Cases**
- ✅ Handle minimum length username
- ✅ Handle maximum length username

**Edge Cases**
- ✅ Handle username with underscores and numbers
- ✅ Handle email with subdomain

### Scenario 2: Inventory Rental Workflow
**File**: `scenario2.test.js` (coming soon)

Tests the complete equipment rental journey:
- Browse available equipment
- Select and rent an item
- View rental in "My Rentals"
- Cancel rental

### Scenario 3: Admin Seminar Management
**File**: `scenario3.test.js` (coming soon)

Tests admin functionality:
- Admin login
- Create new seminar
- Edit seminar details
- Delete seminar

## How Tests Work

### Helpers (`helpers.js`)

Common functions for:
- Browser lifecycle management
- Page navigation
- Form filling
- Element interaction
- API calls
- Test utilities

### Orchestrator (`orchestrator.js`)

Manages:
- Starting backend and frontend servers
- Waiting for services to be ready
- Database seeding
- Running tests
- Cleanup

## Test Structure

Tests use Node's built-in `test` module with:
- `describe()` for grouping related tests
- `it()` for individual test cases
- `before()` and `after()` for setup/cleanup
- `assert` for assertions

Each test includes a descriptive name following the pattern:
`[Category] Description of what is being tested`

## Debugging

### View Browser During Tests

Modify `helpers.js` `launchBrowser()` function:
```javascript
return await puppeteer.launch({
  headless: false,  // Shows browser window
  args: ["--no-sandbox"],
});
```

### Increase Timeout for Slow Networks

Adjust `FRONTEND_URL` or `BACKEND_URL` in helpers if running on different ports/hosts.

### Check Server Logs

The orchestrator inherits stdio from backend/frontend, so you'll see all server logs in the test output.

## Database Reset

Tests use the backend's existing seed scripts:
- `npm run seed:users`
- `npm run seed:seminars`
- `npm run seed:inventory`
- `npm run seed:research`

Seeding runs before each test session via `npm run test:e2e:seed`.

If you need custom test data, modify the seed files in `backend/seeds/`.

## Test Data

Tests use unique identifiers (timestamps) for usernames/emails to avoid collisions:
```javascript
const uniqueUsername = `testuser_${Date.now()}`;
const uniqueEmail = `testuser_${Date.now()}@example.com`;
```

This allows tests to run multiple times without conflicts.

## Adding New Tests

1. Create a new file: `scenarioX.test.js`
2. Import helpers from `helpers.js`
3. Use the same structure as `scenario1.test.js`
4. Orchestrator automatically discovers and runs all `.test.js` files

Example:
```javascript
import { describe, it, before, after } from "node:test";
import { launchBrowser, closeBrowser, goto } from "./helpers.js";

describe("My Scenario", () => {
  let browser, page;
  
  before(async () => {
    browser = await launchBrowser();
    page = await browser.newPage();
  });
  
  after(async () => {
    await closeBrowser(browser);
  });
  
  it("should do something", async () => {
    // test code
  });
});
```

## Troubleshooting

### "Service not ready" error
- Check if port 2169 (backend) or 5173 (frontend) are already in use
- Kill processes: `lsof -ti:2169,5173 | xargs kill -9`

### "Cannot find module 'puppeteer'"
- Run `npm install` in backend directory

### Tests hang
- Increase timeouts in `orchestrator.js`
- Check if Docker/Node processes are consuming too much resources

### Element not found errors
- Selectors may need adjustment if UI changes
- Use browser inspector to verify element selectors
- Add debugging with `await page.screenshot()`

## References

- [Puppeteer Documentation](https://pptr.dev/)
- [Node Test Runner](https://nodejs.org/api/test.html)
- [WCAG Testing](https://www.w3.org/WAI/test-evaluate/)
