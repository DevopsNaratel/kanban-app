import { useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column, Task } from "@/types/kanban";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Ghost } from "lucide-react";
import { SortableContext } from "@dnd-kit/sortable";
import { TaskCard, TaskCardContent } from "./TaskCard";
import React, { useMemo, useState, forwardRef } from "react";
import { useKanban } from "@/context/KanbanContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTaskClick: () => void;
}

export function BoardColumn({ column, tasks, onTaskClick, onAddTaskClick }: BoardColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[320px] h-[500px] bg-muted/50 rounded-xl border-2 border-primary border-dashed opacity-50 flex-shrink-0"
      />
    );
  }

  return (
    <BoardColumnContent
      ref={setNodeRef}
      style={style}
      column={column}
      tasks={tasks}
      onTaskClick={onTaskClick}
      onAddTaskClick={onAddTaskClick}
      attributes={attributes}
      listeners={listeners}
    />
  );
}

interface BoardColumnContentProps extends BoardColumnProps {
  style?: React.CSSProperties;
  attributes?: React.HTMLAttributes<HTMLElement>;
  listeners?: any;
  isOverlay?: boolean;
}

export const BoardColumnContent = forwardRef<HTMLDivElement, BoardColumnContentProps>(
  ({ column, tasks, onTaskClick, onAddTaskClick, style, attributes, listeners, isOverlay }, ref) => {
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
    const { updateColumn, deleteColumn } = useKanban();
    const [isRenaming, setIsRenaming] = useState(false);
    const [columnTitle, setColumnTitle] = useState(column.title);

    const handleRename = () => {
      if (!columnTitle.trim()) return;
      updateColumn(column.id, { title: columnTitle });
      setIsRenaming(false);
    }

    const handleDeleteColumn = () => {
      if (confirm("Are you sure you want to delete this column and all its tasks?")) {
        deleteColumn(column.id);
      }
    }

    return (
      <div ref={ref} style={style} className="w-[320px] flex-shrink-0 flex flex-col h-full max-h-full">
        <Card className="h-full bg-muted/40 border-none shadow-sm flex flex-col rounded-xl overflow-hidden">
          <CardHeader className="p-3 px-4 flex flex-row items-center justify-between space-y-0 bg-background/50 border-b border-border/40 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <div className="flex items-center gap-3 font-semibold flex-1 min-w-0">
              {isRenaming ? (
                <Input
                  value={columnTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColumnTitle(e.target.value)}
                  autoFocus
                  onBlur={handleRename}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setColumnTitle(column.title); // Revert on escape
                      setIsRenaming(false);
                    }
                    e.stopPropagation(); // Stop dnd-kit from interfering with Space key
                  }}
                  className="h-7 px-2 py-1 text-sm font-semibold bg-background"
                  onPointerDown={(e: React.PointerEvent) => e.stopPropagation()} // Prevent drag start when clicking input
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate text-sm font-bold tracking-tight text-foreground/90">{column.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                    {tasks.length}
                  </span>
                </>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 text-muted-foreground hover:bg-muted" onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-500 hover:text-red-500 focus:text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-3 flex-1 flex flex-col min-h-0 bg-transparent">
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 min-h-[100px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-1">
              {!isOverlay && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 py-10 select-none">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Ghost className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-medium">It's quiet here...</p>
                  <p className="text-xs">Drop a task or add one below</p>
                </div>
              ) : (
                <>
                  {isOverlay ? (
                    tasks.map((task) => (
                      <TaskCardContent key={task.id} task={task} onClick={onTaskClick} />
                    ))
                  ) : (
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                      {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                      ))}
                    </SortableContext>
                  )}
                </>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground mt-3 border-dashed hover:border-solid hover:bg-background hover:text-foreground"
              onClick={onAddTaskClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
);
