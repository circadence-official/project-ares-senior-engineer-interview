# Frontend Tests

This directory contains frontend tests for the task management application, specifically testing the task creation flow and dashboard verification.

## Test Setup

The tests use the following testing stack:
- **Vitest** - Test runner and framework
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM environment for testing
- **@testing-library/user-event** - User interaction simulation

## Test Files

### `task-creation-flow.test.tsx`
Comprehensive tests covering:
- Task creation form validation
- API error handling
- Task statistics display
- Recent tasks display
- Navigation flow
- End-to-end task creation and dashboard verification

### `task-dashboard-integration.test.tsx`
Focused integration test that specifically tests the user flow described in the requirements:
1. User creates a task on the tasks page
2. User clicks "Back to Dashboard" button
3. Dashboard page shows the created task

### `dashboard-refresh.test.tsx`
Tests the dashboard refresh functionality:
- Manual refresh button functionality
- Data refetching when refresh is clicked
- Verification that updated data is displayed

## Running Tests

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

### Run Specific Test Files
```bash
# Run only the integration test
npx vitest run src/test/task-dashboard-integration.test.tsx

# Run only the comprehensive test
npx vitest run src/test/task-creation-flow.test.tsx

# Run only the refresh test
npx vitest run src/test/dashboard-refresh.test.tsx
```

## Test Structure

### Mocks
- `mocks.ts` - Contains mock data and API responses
- `test-utils.tsx` - Custom render function with providers and global mocks
- `setup.ts` - Global test setup and environment configuration

### Key Test Scenarios

1. **Task Creation Success Flow**
   - User fills out task form
   - Form validation passes
   - API call succeeds
   - Dialog closes
   - Success feedback shown

2. **Task Creation Error Handling**
   - API call fails
   - Error message displayed
   - Dialog remains open
   - User can retry

3. **Dashboard Task Display**
   - Task statistics are accurate
   - Recent tasks are displayed
   - Empty state when no tasks exist

4. **Navigation Flow**
   - "Back to Dashboard" button triggers navigation
   - Dashboard shows updated task data

5. **Dashboard Refresh**
   - Manual refresh button functionality
   - Automatic data refetching
   - Real-time data updates

## Mocking Strategy

The tests mock:
- API calls (`tasksApi`)
- Authentication context (`AuthContext`)
- Router navigation
- Toast notifications
- Browser APIs (history, location, confirm)

This ensures tests run in isolation without external dependencies.

## Test Data

Tests use consistent mock data:
- Sample task with realistic properties
- Task statistics reflecting the mock task
- Paginated task responses
- User authentication state

## Coverage

The tests cover:
- ✅ Task creation form validation
- ✅ API integration and error handling
- ✅ Dashboard task display
- ✅ Navigation between pages
- ✅ User interaction flows
- ✅ Loading states
- ✅ Empty states
- ✅ Error states
- ✅ Dashboard refresh functionality
- ✅ Real-time data updates
