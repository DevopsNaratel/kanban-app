export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  completed?: boolean;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  color: string;
  lastUpdated: number;
  isStarred?: boolean;
  lastViewed?: number;
  priority?: Priority;
  completed?: boolean;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
  createdAt?: string;
  updatedAt?: string;
}
