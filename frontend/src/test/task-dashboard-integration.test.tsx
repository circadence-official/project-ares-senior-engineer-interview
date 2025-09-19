import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { TasksPage } from '@/pages/TasksPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { tasksApi } from '@/lib/tasks-api';
import { useNavigate } from '@tanstack/react-router';

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

// Mock the router navigation
const mockNavigate = vi.fn();
vi.mocked(useNavigate).mockReturnValue(mockNavigate);

describe('Task Creation and Dashboard Integration', () => {
  const user = userEvent.setup();
  const mockCreateTask = vi.mocked(tasksApi.createTask);
  const mockGetTasks = vi.mocked(tasksApi.getTasks);
  const mockGetTaskStats = vi.mocked(tasksApi.getTaskStats);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should create a task on tasks page and show it on dashboard after clicking "Back to Dashboard"', async () => {
    // Initial state - no tasks
    const initialTasks = {
      tasks: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    const initialStats = {
      total: 0,
      pending: 0,
      completed: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
    };

    // New task to be created
    const newTask = {
      id: 'new-task-1',
      title: 'My New Task',
      description: 'A task created during testing',
      status: 'pending' as const,
      priority: 'medium' as const,
      userId: 'user1',
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2024-01-01T12:00:00Z',
    };

    // Updated state after task creation
    const updatedTasks = {
      tasks: [newTask],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    const updatedStats = {
      total: 1,
      pending: 1,
      completed: 0,
      highPriority: 0,
      mediumPriority: 1,
      lowPriority: 0,
    };

    // Set up initial mocks
    mockGetTasks.mockResolvedValue(initialTasks);
    mockGetTaskStats.mockResolvedValue(initialStats);
    mockCreateTask.mockResolvedValue(newTask);

    // Step 1: Render Tasks Page
    const { unmount: unmountTasks } = render(<TasksPage />);

    // Wait for tasks page to load
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    // Step 2: Create a new task
    const createTaskButton = screen.getByText('Create Task');
    await user.click(createTaskButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    // Fill in task details
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');

    await user.type(titleInput, 'My New Task');
    await user.type(descriptionInput, 'A task created during testing');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    // Verify task was created
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        {
          title: 'My New Task',
          description: 'A task created during testing',
          status: 'pending',
          priority: 'medium',
        },
        expect.any(Object) // React Query mutation context
      );
    });

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    // Step 3: Click "Back to Dashboard" button
    const backButton = screen.getByText('Back to Dashboard');
    await user.click(backButton);

    // Verify navigation was triggered
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });

    // Unmount tasks page
    unmountTasks();

    // Step 4: Update mocks for dashboard view
    mockGetTasks.mockResolvedValue(updatedTasks);
    mockGetTaskStats.mockResolvedValue(updatedStats);

    // Step 5: Render Dashboard Page
    render(<DashboardPage />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });

    // Step 6: Verify the created task appears on dashboard
    await waitFor(() => {
      // Check that task statistics show 1 total task
      const totalTasksElement = screen.getByText('Total Tasks').closest('.rounded-lg');
      expect(totalTasksElement).toHaveTextContent('1');
      
      // Check that the task appears in recent tasks
      expect(screen.getByText('My New Task')).toBeInTheDocument();
      expect(screen.getByText('A task created during testing')).toBeInTheDocument();
      
      // Check task status and priority badges
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    // Verify API calls were made correctly
    expect(mockGetTaskStats).toHaveBeenCalled();
    expect(mockGetTasks).toHaveBeenCalledWith({}, { limit: 5 });
  });

  it('should handle the case when task creation fails', async () => {
    // Mock API error
    mockCreateTask.mockRejectedValue(new Error('Network error'));

    // Initial state
    const initialTasks = {
      tasks: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    const initialStats = {
      total: 0,
      pending: 0,
      completed: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
    };

    mockGetTasks.mockResolvedValue(initialTasks);
    mockGetTaskStats.mockResolvedValue(initialStats);

    render(<TasksPage />);

    // Wait for tasks page to load
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    // Try to create a task
    const createTaskButton = screen.getByText('Create Task');
    await user.click(createTaskButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    // Fill in task details
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Failing Task');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Dialog should still be open
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });
});
