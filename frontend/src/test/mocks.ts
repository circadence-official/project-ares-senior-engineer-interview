import { vi } from 'vitest';
import type { Task, CreateTaskData, TaskStats, PaginatedTasks } from '@/types';

// Mock task data
export const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'medium',
  userId: 'user1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockTaskStats: TaskStats = {
  total: 1,
  pending: 1,
  completed: 0,
  highPriority: 0,
  mediumPriority: 1,
  lowPriority: 0,
};

export const mockPaginatedTasks: PaginatedTasks = {
  tasks: [mockTask],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

// Mock tasks API
export const mockTasksApi = {
  getTasks: vi.fn().mockResolvedValue(mockPaginatedTasks),
  getTaskStats: vi.fn().mockResolvedValue(mockTaskStats),
  getTask: vi.fn().mockResolvedValue(mockTask),
  createTask: vi.fn().mockResolvedValue(mockTask),
  updateTask: vi.fn().mockResolvedValue(mockTask),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  bulkUpdateTasks: vi.fn().mockResolvedValue([mockTask]),
  bulkDeleteTasks: vi.fn().mockResolvedValue(undefined),
};

// Mock API module
export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Mock token manager
export const mockTokenManager = {
  hasToken: vi.fn().mockReturnValue(true),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn(),
  removeToken: vi.fn(),
};
