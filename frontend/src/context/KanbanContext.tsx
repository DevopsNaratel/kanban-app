/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Board, Column, Task } from '../types/kanban';
import api from '../services/api';

// Feature flag: Set to true to use API, false to use local state
const USE_API = true; // Toggle this when backend is ready

interface KanbanContextType {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addBoard: (board: Omit<Board, 'id' | 'lastUpdated'>) => Promise<void>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  toggleBoardStar: (id: string) => Promise<void>;
  markBoardAsViewed: (id: string) => Promise<void>;
  addColumn: (column: Omit<Column, 'id'>) => Promise<void>;
  updateColumn: (id: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, newColumnId: string) => Promise<void>;
  moveColumn: (columnId: string, newIndex: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getBoardColumns: (boardId: string) => Column[];
  getColumnTasks: (columnId: string) => Task[];
  getBoardTasks: (boardId: string) => Task[];
  refreshData: () => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const initialBoards: Board[] = [];

const initialColumns: Column[] = [];

const initialTasks: Task[] = [];

const generateId = () => Math.random().toString(36).substring(2, 9);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from API if enabled
  useEffect(() => {
    if (USE_API) {
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Refresh all data from API
  const refreshData = React.useCallback(async () => {
    if (!USE_API) return;

    setLoading(true);
    setError(null);

    try {
      const [boardsData, tasksData] = await Promise.all([
        api.boards.getAll(),
        api.tasks.getAll(),
      ]);

      setBoards(boardsData);
      setTasks(tasksData);

      // Load columns for all boards
      const allColumns: Column[] = [];
      for (const board of boardsData) {
        const boardColumns = await api.columns.getByBoardId(board.id);
        allColumns.push(...boardColumns);
      }
      setColumns(allColumns);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== BOARD OPERATIONS ====================

  const addBoard = React.useCallback(async (board: Omit<Board, 'id' | 'lastUpdated'>) => {
    if (USE_API) {
      try {
        const newBoard = await api.boards.create(board);
        setBoards(prev => [...prev, newBoard]);

        // Backend automatically creates default columns, so we just need to fetch them
        const boardColumns = await api.columns.getByBoardId(newBoard.id);
        setColumns(prev => [...prev, ...boardColumns]);
      } catch (err) {
        console.error('Error creating board:', err);
        throw err;
      }
    } else {
      // Local state mode
      const newBoard: Board = {
        ...board,
        id: generateId(),
        lastUpdated: Date.now(),
        isStarred: false,
      };
      setBoards(prev => [...prev, newBoard]);
      const boardId = newBoard.id;
      setColumns(prev => [
        ...prev,
        { id: generateId(), boardId, title: 'To Do', order: 0 },
        { id: generateId(), boardId, title: 'In Progress', order: 1 },
        { id: generateId(), boardId, title: 'Done', order: 2 },
      ]);
    }
  }, []);

  const updateBoard = React.useCallback(async (id: string, updates: Partial<Board>) => {
    if (USE_API) {
      try {
        const updatedBoard = await api.boards.update(id, updates);
        setBoards(prev => prev.map(b => b.id === id ? updatedBoard : b));
      } catch (err) {
        console.error('Error updating board:', err);
        throw err;
      }
    } else {
      setBoards(prev => prev.map(b => b.id === id ? { ...b, ...updates, lastUpdated: Date.now() } : b));
    }
  }, []);

  const toggleBoardStar = React.useCallback(async (id: string) => {
    if (USE_API) {
      try {
        const updatedBoard = await api.boards.toggleStar(id);
        setBoards(prev => prev.map(b => b.id === id ? updatedBoard : b));
      } catch (err) {
        console.error('Error toggling star:', err);
        throw err;
      }
    } else {
      setBoards(prev => prev.map(b => b.id === id ? { ...b, isStarred: !b.isStarred } : b));
    }
  }, []);

  const markBoardAsViewed = React.useCallback(async (id: string) => {
    if (USE_API) {
      try {
        const updatedBoard = await api.boards.markAsViewed(id);
        setBoards(prev => prev.map(b => b.id === id ? updatedBoard : b));
      } catch (err) {
        console.error('Error marking as viewed:', err);
        throw err;
      }
    } else {
      setBoards(prev => prev.map(b => b.id === id ? { ...b, lastViewed: Date.now() } : b));
    }
  }, []);

  const deleteBoard = React.useCallback(async (id: string) => {
    if (USE_API) {
      try {
        await api.boards.delete(id);
        setBoards(prev => prev.filter(b => b.id !== id));
        setColumns(prev => prev.filter(c => c.boardId !== id));
        // Tasks will be deleted by backend cascade
        const boardColumnIds = columns.filter(c => c.boardId === id).map(c => c.id);
        setTasks(prev => prev.filter(t => !boardColumnIds.includes(t.columnId)));
      } catch (err) {
        console.error('Error deleting board:', err);
        throw err;
      }
    } else {
      setBoards(prev => prev.filter(b => b.id !== id));
      const boardColumnIds = columns.filter(c => c.boardId === id).map(c => c.id);
      setColumns(prev => prev.filter(c => c.boardId !== id));
      setTasks(prev => prev.filter(t => !boardColumnIds.includes(t.columnId)));
    }
  }, [columns]);

  // ==================== COLUMN OPERATIONS ====================

  const addColumn = React.useCallback(async (column: Omit<Column, 'id'>) => {
    if (USE_API) {
      try {
        const newColumn = await api.columns.create(column);
        setColumns(prev => [...prev, newColumn]);
      } catch (err) {
        console.error('Error creating column:', err);
        throw err;
      }
    } else {
      setColumns(prev => [...prev, { ...column, id: generateId() }]);
    }
  }, []);

  const updateColumn = React.useCallback(async (id: string, updates: Partial<Column>) => {
    if (USE_API) {
      try {
        const updatedColumn = await api.columns.update(id, updates);
        setColumns(prev => prev.map(c => c.id === id ? updatedColumn : c));
      } catch (err) {
        console.error('Error updating column:', err);
        throw err;
      }
    } else {
      setColumns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }, []);

  const deleteColumn = React.useCallback(async (id: string) => {
    if (USE_API) {
      try {
        await api.columns.delete(id);
        setColumns(prev => prev.filter(c => c.id !== id));
        setTasks(prev => prev.filter(t => t.columnId !== id));
      } catch (err) {
        console.error('Error deleting column:', err);
        throw err;
      }
    } else {
      setColumns(prev => prev.filter(c => c.id !== id));
      setTasks(prev => prev.filter(t => t.columnId !== id));
    }
  }, []);

  const moveColumn = React.useCallback(async (columnId: string, newIndex: number) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    const boardId = column.boardId;
    const boardColumns = columns
      .filter(c => c.boardId === boardId)
      .sort((a, b) => a.order - b.order);

    const oldIndex = boardColumns.findIndex(c => c.id === columnId);
    if (oldIndex === -1) return;

    const newBoardColumns = [...boardColumns];
    const [movedColumn] = newBoardColumns.splice(oldIndex, 1);
    newBoardColumns.splice(newIndex, 0, movedColumn);

    const updatedBoardColumns = newBoardColumns.map((c, index) => ({ ...c, order: index }));

    if (USE_API) {
      try {
        const columnOrders = updatedBoardColumns.map(c => ({ id: c.id, order: c.order }));
        await api.columns.reorder(boardId, columnOrders);

        setColumns(prev => prev.map(c => {
          const updated = updatedBoardColumns.find(uc => uc.id === c.id);
          return updated || c;
        }));
      } catch (err) {
        console.error('Error reordering columns:', err);
        throw err;
      }
    } else {
      setColumns(prev => prev.map(c => {
        const updated = updatedBoardColumns.find(uc => uc.id === c.id);
        return updated || c;
      }));
    }
  }, [columns]);

  // ==================== TASK OPERATIONS ====================

  const addTask = React.useCallback(async (task: Omit<Task, 'id'>) => {
    if (USE_API) {
      try {
        const newTask = await api.tasks.create(task);
        setTasks(prev => [...prev, newTask]);
      } catch (err) {
        console.error('Error creating task:', err);
        throw err;
      }
    } else {
      setTasks(prev => [...prev, { ...task, id: generateId() }]);
    }
  }, []);

  const updateTask = React.useCallback(async (id: string, updates: Partial<Task>) => {
    if (USE_API) {
      try {
        const updatedTask = await api.tasks.update(id, updates);
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      } catch (err) {
        console.error('Error updating task:', err);
        throw err;
      }
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  }, []);

  const moveTask = React.useCallback(async (taskId: string, newColumnId: string) => {
    if (USE_API) {
      try {
        const updatedTask = await api.tasks.move(taskId, newColumnId);
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      } catch (err) {
        console.error('Error moving task:', err);
        throw err;
      }
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: newColumnId } : t));
    }
  }, []);

  const deleteTask = React.useCallback(async (id: string) => {
    if (USE_API) {
      try {
        await api.tasks.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error('Error deleting task:', err);
        throw err;
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  // ==================== GETTERS ====================

  const getBoardColumns = React.useCallback((boardId: string) => {
    return columns.filter(c => c.boardId === boardId).sort((a, b) => a.order - b.order);
  }, [columns]);

  const getColumnTasks = React.useCallback((columnId: string) => {
    return tasks.filter(t => t.columnId === columnId);
  }, [tasks]);

  const getBoardTasks = React.useCallback((boardId: string) => {
    const boardColumnIds = columns.filter(c => c.boardId === boardId).map(c => c.id);
    return tasks.filter(t => boardColumnIds.includes(t.columnId));
  }, [tasks, columns]);

  const value = React.useMemo(() => ({
    boards, columns, tasks, loading, error,
    addBoard, updateBoard, deleteBoard, toggleBoardStar, markBoardAsViewed,
    addColumn, updateColumn, deleteColumn, moveColumn,
    addTask, updateTask, moveTask, deleteTask,
    getBoardColumns, getColumnTasks, getBoardTasks,
    refreshData,
  }), [
    boards, columns, tasks, loading, error,
    addBoard, updateBoard, deleteBoard, toggleBoardStar, markBoardAsViewed,
    addColumn, updateColumn, deleteColumn, moveColumn,
    addTask, updateTask, moveTask, deleteTask,
    getBoardColumns, getColumnTasks, getBoardTasks,
    refreshData,
  ]);

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
