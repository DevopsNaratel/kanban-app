import { apiClient } from '../config/api';
import type { Board, Column, Task } from '../types/kanban';

// ==================== BOARDS API ====================

export const boardsApi = {
    // Get all boards
    getAll: async (): Promise<Board[]> => {
        const response = await apiClient.get<Board[]>('/boards');
        return response.data;
    },

    // Get single board by ID
    getById: async (id: string): Promise<Board> => {
        const response = await apiClient.get<Board>(`/boards/${id}`);
        return response.data;
    },

    // Create new board
    create: async (board: Omit<Board, 'id' | 'lastUpdated'>): Promise<Board> => {
        const response = await apiClient.post<Board>('/boards', board);
        return response.data;
    },

    // Update board
    update: async (id: string, updates: Partial<Board>): Promise<Board> => {
        const response = await apiClient.patch<Board>(`/boards/${id}`, updates);
        return response.data;
    },

    // Delete board
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/boards/${id}`);
    },

    // Toggle board star
    toggleStar: async (id: string): Promise<Board> => {
        const response = await apiClient.patch<Board>(`/boards/${id}/star`);
        return response.data;
    },

    // Mark board as viewed
    markAsViewed: async (id: string): Promise<Board> => {
        const response = await apiClient.patch<Board>(`/boards/${id}/view`);
        return response.data;
    },
};

// ==================== COLUMNS API ====================

export const columnsApi = {
    // Get all columns for a board
    getByBoardId: async (boardId: string): Promise<Column[]> => {
        const response = await apiClient.get<Column[]>(`/boards/${boardId}/columns`);
        return response.data;
    },

    // Get single column by ID
    getById: async (id: string): Promise<Column> => {
        const response = await apiClient.get<Column>(`/columns/${id}`);
        return response.data;
    },

    // Create new column
    create: async (column: Omit<Column, 'id'>): Promise<Column> => {
        const response = await apiClient.post<Column>('/columns', column);
        return response.data;
    },

    // Update column
    update: async (id: string, updates: Partial<Column>): Promise<Column> => {
        const response = await apiClient.patch<Column>(`/columns/${id}`, updates);
        return response.data;
    },

    // Delete column
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/columns/${id}`);
    },

    // Reorder columns
    reorder: async (boardId: string, columnOrders: { id: string; order: number }[]): Promise<Column[]> => {
        const response = await apiClient.patch<Column[]>(`/boards/${boardId}/columns/reorder`, {
            columnOrders,
        });
        return response.data;
    },
};

// ==================== TASKS API ====================

export const tasksApi = {
    // Get all tasks
    getAll: async (): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>('/tasks');
        return response.data;
    },

    // Get tasks by column ID
    getByColumnId: async (columnId: string): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>(`/columns/${columnId}/tasks`);
        return response.data;
    },

    // Get tasks by board ID
    getByBoardId: async (boardId: string): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>(`/boards/${boardId}/tasks`);
        return response.data;
    },

    // Get single task by ID
    getById: async (id: string): Promise<Task> => {
        const response = await apiClient.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    // Create new task
    create: async (task: Omit<Task, 'id'>): Promise<Task> => {
        const response = await apiClient.post<Task>('/tasks', task);
        return response.data;
    },

    // Update task
    update: async (id: string, updates: Partial<Task>): Promise<Task> => {
        const response = await apiClient.patch<Task>(`/tasks/${id}`, updates);
        return response.data;
    },

    // Move task to different column
    move: async (taskId: string, newColumnId: string): Promise<Task> => {
        const response = await apiClient.patch<Task>(`/tasks/${taskId}/move`, {
            columnId: newColumnId,
        });
        return response.data;
    },

    // Delete task
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tasks/${id}`);
    },
};

// ==================== COMBINED API ====================

export const api = {
    boards: boardsApi,
    columns: columnsApi,
    tasks: tasksApi,
};

export default api;
