import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { TasksPage } from '@/pages/TasksPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { tasksApi } from '@/lib/tasks-api';
import { mockTask, mockTaskStats, mockPaginatedTasks } from '../test/mocks';

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
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Task Creation and Dashboard Flow', () => {
  const user = userEvent.setup();
  const mockCreateTask = vi.mocked(tasksApi.createTask);
  const mockGetTasks = vi.mocked(tasksApi.getTasks);
  const mockGetTaskStats = vi.mocked(tasksApi.getTaskStats);

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Set up default mock implementations
    mockGetTasks.mockResolvedValue(mockPaginatedTasks);
    mockGetTaskStats.mockResolvedValue(mockTaskStats);
    mockCreateTask.mockResolvedValue(mockTask);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Task Creation Flow', () => {
    it('should create a task and show success message', async () => {
      render(<TasksPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });

      // Click the "Create Task" button
      const createTaskButton = screen.getByText('Create Task');
      await user.click(createTaskButton);

      // Wait for the dialog to open
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill in the task form
      const titleInput = screen.getByLabelText('Title');
      const descriptionInput = screen.getByLabelText('Description');
      const statusSelect = screen.getByLabelText('Status');
      const prioritySelect = screen.getByLabelText('Priority');

      await user.type(titleInput, 'New Test Task');
      await user.type(descriptionInput, 'This is a test task description');
      await user.selectOptions(statusSelect, 'pending');
      await user.selectOptions(prioritySelect, 'high');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify the API was called with correct data
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          {
            title: 'New Test Task',
            description: 'This is a test task description',
            status: 'pending',
            priority: 'high',
          },
          expect.any(Object) // React Query mutation context
        );
      });

      // Verify the dialog closes
      await waitFor(() => {
        expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
      });
    });

    it('should prevent submission with empty title', async () => {
      render(<TasksPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });

      // Click the "Create Task" button
      const createTaskButton = screen.getByText('Create Task');
      await user.click(createTaskButton);

      // Wait for the dialog to open
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify API was not called (form validation prevents submission)
      expect(mockCreateTask).not.toHaveBeenCalled();
      
      // Dialog should still be open
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockCreateTask.mockRejectedValue(new Error('Failed to create task'));

      render(<TasksPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });

      // Click the "Create Task" button
      const createTaskButton = screen.getByText('Create Task');
      await user.click(createTaskButton);

      // Wait for the dialog to open
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill in the task form
      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Task');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText('Failed to create task')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Task Display', () => {
    it('should display task statistics correctly', async () => {
      render(<DashboardPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Task Manager')).toBeInTheDocument();
      });

      // Verify task statistics are displayed
      await waitFor(() => {
        expect(screen.getByText('Total Tasks')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('High Priority')).toBeInTheDocument();
        
        // Check that the statistics show the correct values
        const totalTasksElement = screen.getByText('Total Tasks').closest('.rounded-lg');
        expect(totalTasksElement).toHaveTextContent('1');
      });
    });

    it('should display recent tasks correctly', async () => {
      render(<DashboardPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Task Manager')).toBeInTheDocument();
      });

      // Verify recent tasks section
      await waitFor(() => {
        expect(screen.getByText('Recent Tasks')).toBeInTheDocument();
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
      });
    });

    it('should show empty state when no tasks exist', async () => {
      // Mock empty tasks response
      mockGetTasks.mockResolvedValue({
        tasks: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      mockGetTaskStats.mockResolvedValue({
        total: 0,
        pending: 0,
        completed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
      });

      render(<DashboardPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Task Manager')).toBeInTheDocument();
      });

      // Verify empty state
      await waitFor(() => {
        expect(screen.getByText('No tasks yet. Create your first task to get started!')).toBeInTheDocument();
        expect(screen.getByText('Create Task')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should render the Back to Dashboard button', async () => {
      render(<TasksPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });

      // Verify the Back to Dashboard button is present
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  describe('End-to-End Task Creation and Dashboard Verification', () => {
    it('should create a task and verify it appears on dashboard', async () => {
      // Create a new task for this test
      const newTask = {
        ...mockTask,
        id: '2',
        title: 'E2E Test Task',
        description: 'End-to-end test task',
        status: 'pending' as const,
        priority: 'high' as const,
      };

      // Mock the create task response
      mockCreateTask.mockResolvedValue(newTask);

      // Mock updated tasks list with the new task
      const updatedTasks = {
        tasks: [mockTask, newTask],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      // Mock updated stats
      const updatedStats = {
        total: 2,
        pending: 2,
        completed: 0,
        highPriority: 1,
        mediumPriority: 1,
        lowPriority: 0,
      };

      // First, render the Tasks page
      const { unmount } = render(<TasksPage />);

      // Wait for the page to load
      await waitFor(() => {
        expect(screen.getByText('Tasks')).toBeInTheDocument();
      });

      // Create a new task
      const createTaskButton = screen.getByText('Create Task');
      await user.click(createTaskButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill in the task form
      const titleInput = screen.getByLabelText('Title');
      const descriptionInput = screen.getByLabelText('Description');
      const prioritySelect = screen.getByLabelText('Priority');

      await user.type(titleInput, 'E2E Test Task');
      await user.type(descriptionInput, 'End-to-end test task');
      await user.selectOptions(prioritySelect, 'high');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Wait for task creation
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          {
            title: 'E2E Test Task',
            description: 'End-to-end test task',
            status: 'pending',
            priority: 'high',
          },
          expect.any(Object) // React Query mutation context
        );
      });

      // Unmount the Tasks page
      unmount();

      // Update mocks for dashboard
      mockGetTasks.mockResolvedValue(updatedTasks);
      mockGetTaskStats.mockResolvedValue(updatedStats);

      // Now render the Dashboard page
      render(<DashboardPage />);

      // Wait for the dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Task Manager')).toBeInTheDocument();
      });

      // Verify the new task appears in recent tasks
      await waitFor(() => {
        expect(screen.getByText('E2E Test Task')).toBeInTheDocument();
        expect(screen.getByText('End-to-end test task')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
      });

      // Verify updated statistics
      await waitFor(() => {
        const totalTasksElement = screen.getByText('Total Tasks').closest('.rounded-lg');
        expect(totalTasksElement).toHaveTextContent('2');
      });
    });
  });
});
