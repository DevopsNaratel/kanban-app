import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useKanban } from "@/context/KanbanContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, FilterX } from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    addDays,
    subDays
} from "date-fns";
import { TaskDetailDialog } from "@/pages/board/components/TaskDetailDialog";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/kanban";

type ViewMode = "month" | "week" | "day";

export default function AllTasksPage() {
    const { tasks, updateTask, addTask, deleteTask, boards, getBoardColumns, moveTask } = useKanban();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");

    // For creating tasks from calendar
    const [createTaskDate, setCreateTaskDate] = useState<Date | undefined>(undefined);

    const handlePrevious = () => {
        if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
        if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
        if (viewMode === "day") setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
        if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
        if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDialogOpen(true);
    };

    const handleDateClick = (date: Date) => {
        setCreateTaskDate(date);
        setSelectedTask(null);
        setIsDialogOpen(true);
    };

    // Filter tasks for the current view
    const visibleTasks = useMemo(() => {
        return tasks.filter(task => {
            // 1. Date Check
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            if (isNaN(taskDate.getTime())) return false; // Skip invalid dates

            let matchesDate = false;
            if (viewMode === "month") {
                matchesDate = isSameMonth(taskDate, currentDate);
            } else if (viewMode === "week") {
                const start = startOfWeek(currentDate);
                const end = endOfWeek(currentDate);
                matchesDate = taskDate >= start && taskDate <= end;
            } else if (viewMode === "day") {
                matchesDate = isSameDay(taskDate, currentDate);
            }
            
            if (!matchesDate) return false;

            // 2. Search Check
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = 
                    task.title.toLowerCase().includes(query) || 
                    (task.description?.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // 3. Priority Check
            if (priorityFilter !== "all" && task.priority !== priorityFilter) {
                return false;
            }

            return true;
        });
    }, [tasks, currentDate, viewMode, searchQuery, priorityFilter]);

    // Calendar Grid Generation
    const days = useMemo(() => {
        if (viewMode === "month") {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            return eachDayOfInterval({ start: startDate, end: endDate });
        }
        if (viewMode === "week") {
            return eachDayOfInterval({
                start: startOfWeek(currentDate),
                end: endOfWeek(currentDate)
            });
        }
        return [currentDate];
    }, [currentDate, viewMode]);

    const getTasksForDay = (day: Date) => {
        return visibleTasks.filter(t => isSameDay(new Date(t.dueDate!), day));
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur z-10 shrink-0 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-bold text-lg">All Tasks</h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-4">
                        <Button
                            variant={viewMode === "month" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setViewMode("month")}
                        >
                            Month
                        </Button>
                        <Button
                            variant={viewMode === "week" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setViewMode("week")}
                        >
                            Week
                        </Button>
                        <Button
                            variant={viewMode === "day" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setViewMode("day")}
                        >
                            Day
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 border rounded-md px-2 py-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-32 text-center">
                            {format(currentDate, viewMode === 'day' ? 'PPP' : 'MMMM yyyy')}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleToday}>
                        Today
                    </Button>
                </div>
            </header>

            {/* Filter Toolbar */}
            <div className="px-6 py-3 border-b bg-muted/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[160px] h-9 bg-background">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                    </Select>
                    {(searchQuery || priorityFilter !== 'all') && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSearchQuery(""); setPriorityFilter("all"); }}
                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                            title="Clear filters"
                        >
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Calendar View */}
            <div className="flex-1 overflow-auto p-6">
                <div className={cn(
                    "grid h-full border rounded-lg overflow-hidden bg-card shadow-sm",
                    viewMode === "month" ? "grid-cols-7 grid-rows-[auto_1fr]" :
                        viewMode === "week" ? "grid-cols-7 grid-rows-[auto_1fr]" :
                            "grid-cols-1 grid-rows-[auto_1fr]"
                )}>
                    {/* Day Headers */}
                    {viewMode !== 'day' && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-r last:border-r-0 bg-muted/30">
                            {day}
                        </div>
                    ))}

                    {/* Calendar Grid */}
                    <div className={cn(
                        "col-span-full grid h-full",
                        viewMode === "month" ? "grid-cols-7 grid-rows-5" : // Approx 5 rows for month
                            viewMode === "week" ? "grid-cols-7 grid-rows-1" :
                                "grid-cols-1 grid-rows-1"
                    )}>
                        {days.map((day) => {
                            const dayTasks = getTasksForDay(day);
                            const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true;
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "min-h-[120px] p-2 border-b border-r last:border-r-0 hover:bg-muted/20 transition-colors flex flex-col gap-1 cursor-pointer",
                                        !isCurrentMonth && "bg-muted/10 text-muted-foreground opacity-50",
                                        isTodayDate && "bg-primary/5"
                                    )}
                                    onClick={() => handleDateClick(day)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={cn(
                                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                            isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </span>
                                        {viewMode === 'day' && (
                                            <span className="text-xs text-muted-foreground">
                                                {format(day, "EEEE")}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[150px] scrollbar-hide">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    "px-2 py-1 rounded text-xs truncate border font-medium cursor-pointer shadow-sm hover:opacity-80",
                                                    task.priority === 'high' ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900" :
                                                        task.priority === 'medium' ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900" :
                                                            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTaskClick(task);
                                                }}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <TaskDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                task={selectedTask}
                onUpdate={updateTask}
                onCreate={async (task) => {
                    // Inject the clicked date if we're creating from a calendar click
                    await addTask({
                        ...task,
                        dueDate: createTaskDate ? createTaskDate.toDateString() : task.dueDate
                    })
                }}
                onDelete={deleteTask}
                columns={boards.flatMap(b => getBoardColumns(b.id))} // Flatten all columns for selection
                onMoveTask={moveTask}
                // We don't have a specific column context here, so let the dialog handle defaults
                boards={boards}
            />
        </div>
    );
}