import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '@/pages/DashboardPage';
import { tasksApi } from '@/lib/tasks-api';

// Mock the tasks API
vi.mock('@/lib/tasks-api', () => ({
  tasksApi: {
    getTasks: vi.fn(),
    getTaskStats: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

describe('Dashboard Refresh Functionality', () => {
  const user = userEvent.setup();
  const mockGetTasks = vi.mocked(tasksApi.getTasks);
  const mockGetTaskStats = vi.mocked(tasksApi.getTaskStats);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should automatically refresh data when component mounts', async () => {
    // Mock initial data
    const initialStats = {
      total: 1,
      pending: 1,
      completed: 0,
      highPriority: 0,
      mediumPriority: 1,
      lowPriority: 0,
    };

    const initialTasks = {
      tasks: [{
        id: '1',
        title: 'Initial Task',
        description: 'Initial description',
        status: 'pending' as const,
        priority: 'medium' as const,
        userId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };

    // Set up initial mocks
    mockGetTasks.mockResolvedValue(initialTasks);
    mockGetTaskStats.mockResolvedValue(initialStats);

    render(<DashboardPage />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });

    // Verify initial data is displayed
    await waitFor(() => {
      expect(screen.getByText('Initial Task')).toBeInTheDocument();
    });

    // Verify API calls were made (including the automatic refresh on mount)
    await waitFor(() => {
      expect(mockGetTaskStats).toHaveBeenCalled();
      expect(mockGetTasks).toHaveBeenCalledWith({}, { limit: 5 });
    });
  });
});
