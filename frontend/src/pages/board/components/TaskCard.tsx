import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/types/kanban";
import { Calendar, MoreVertical, Edit2, Trash2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKanban } from "@/context/KanbanContext";
import React, { forwardRef } from "react";
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
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
        className="opacity-30 bg-primary/10 h-[120px] rounded-lg border-2 border-primary border-dashed"
      />
    );
  }

  return (
    <TaskCardContent
      ref={setNodeRef}
      style={style}
      task={task}
      onClick={onClick}
      attributes={attributes}
      listeners={listeners}
    />
  );
}

interface TaskCardContentProps extends TaskCardProps {
  style?: React.CSSProperties;
  attributes?: React.HTMLAttributes<HTMLElement>;
  listeners?: any;
}

export const TaskCardContent = forwardRef<HTMLDivElement, TaskCardContentProps>(
  ({ task, onClick, style, attributes, listeners }, ref) => {
    const { deleteTask } = useKanban();

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Delete this task?")) {
        deleteTask(task.id);
      }
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(task);
    }

    const priorityColor = {
      high: "border-l-red-500",
      medium: "border-l-orange-500",
      low: "border-l-blue-500",
    }[task.priority] || "border-l-slate-200";

    const getDueDateStatus = (dateStr?: string) => {
      if (!dateStr) return null;
      
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
          // Fallback for non-standard date strings like "Sunday", "Daily"
          return { color: "text-muted-foreground", icon: Calendar, label: dateStr };
      }

      if (isPast(date) && !isToday(date)) return { color: "text-red-500", icon: AlertCircle, label: "Overdue" };
      if (isToday(date)) return { color: "text-orange-500", icon: Clock, label: "Due Today" };
      if (isTomorrow(date)) return { color: "text-yellow-500", icon: Clock, label: "Due Tomorrow" };
      return { color: "text-muted-foreground", icon: Calendar, label: formatDistanceToNow(date, { addSuffix: true }) };
    };

    const dueStatus = getDueDateStatus(task.dueDate);

    return (
      <div ref={ref} style={style} {...attributes} {...listeners} className="touch-none group">
        <Card
          className={cn(
            "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-l-4",
            priorityColor
          )}
          onClick={() => onClick(task)}
        >
          <CardHeader className="p-3 pb-1 space-y-0 flex flex-row items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
              {task.title}
            </CardTitle>
            
             {/* Quick Actions (Visible on Hover) + Menu */}
             <div className="flex items-center -mr-2 -mt-2">
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={handleEdit} onPointerDown={(e) => e.stopPropagation()}>
                        <Edit2 className="h-3 w-3" />
                    </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(task); }}>
                      <Edit2 className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            {task.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-auto">
               {/* Priority Label (Subtle) */}
               <span className={cn(
                   "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
                   task.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                   task.priority === "medium" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
               )}>
                   {task.priority}
               </span>

              {dueStatus && (
                <div className={cn("flex items-center text-[11px] font-medium", dueStatus.color)}>
                  <dueStatus.icon className="h-3 w-3 mr-1" />
                  {dueStatus.label}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);
