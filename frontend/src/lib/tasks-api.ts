import api from './api';
import type { 
  Task, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskFilters, 
  TaskStats,
  PaginatedTasks,
  PaginationParams,
  SortParams 
} from '@/types';

export const tasksApi = {
  // Get paginated tasks with filtering
  getTasks: async (
    filters: TaskFilters = {},
    pagination: PaginationParams = {},
    sort: SortParams = {}
  ): Promise<PaginatedTasks> => {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    
    // Add sorting
    if (sort.sortBy) params.append('sortBy', sort.sortBy);
    if (sort.sortOrder) params.append('sortOrder', sort.sortOrder);
    
    const response = await api.get<any>(`/tasks?${params.toString()}`);
    return {
      tasks: response.data.data,
      pagination: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.totalCount,
        totalPages: response.data.pagination.totalPages,
      }
    };
  },

  // Get task statistics
  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get<any>('/tasks/stats');
    const data = response.data.data;
    return {
      total: data.totalTasks,
      pending: data.pendingTasks,
      completed: data.completedTasks,
      highPriority: data.highPriorityTasks,
      mediumPriority: data.mediumPriorityTasks,
      lowPriority: data.lowPriorityTasks,
    };
  },

  // Get single task
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<any>(`/tasks/${id}`);
    return response.data.data;
  },

  // Create new task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post<any>('/tasks', data);
    return response.data.data;
  },

  // Update existing task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put<any>(`/tasks/${id}`, data);
    return response.data.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Bulk operations
  bulkUpdateTasks: async (ids: string[], data: UpdateTaskData): Promise<Task[]> => {
    const response = await api.patch<Task[]>('/tasks/bulk', { ids, data });
    return response.data;
  },

  bulkDeleteTasks: async (ids: string[]): Promise<void> => {
    await api.delete('/tasks/bulk', { data: { ids } });
  },
};