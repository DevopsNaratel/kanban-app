export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
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
}
