import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { type Board } from "@/types/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Tag, LayoutList, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Column, Priority } from "@/types/kanban";

interface TaskDetailDialogProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onCreate: (task: Omit<Task, 'id'>) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
    columns: Column[];
    onMoveTask: (taskId: string, newColumnId: string) => Promise<void>;
    defaultColumnId?: string;
    boards?: Board[]; // Optional list of boards to resolve column ownership
}

export function TaskDetailDialog({
    task,
    isOpen,
    onClose,
    onUpdate,
    onCreate,
    onDelete,
    columns,
    onMoveTask,
    defaultColumnId,
    boards
}: TaskDetailDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [columnId, setColumnId] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setTitle(task.title);
                setDescription(task.description || "");
                setPriority(task.priority);

                // Safe date parsing
                if (task.dueDate) {
                    const parsed = new Date(task.dueDate);
                    if (!isNaN(parsed.getTime())) {
                        setDueDate(parsed);
                    } else {
                        setDueDate(undefined);
                    }
                } else {
                    setDueDate(undefined);
                }

                setColumnId(task.columnId || defaultColumnId || columns[0]?.id || "");
            } else {
                // Create mode - reset defaults
                setTitle("");
                setDescription("");
                setPriority("medium");
                setDueDate(undefined);
                setColumnId(defaultColumnId || columns[0]?.id || "");
            }
        }
    }, [task, isOpen, defaultColumnId, columns]);

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter a task title");
            return;
        }
        if (!columnId) {
            alert("Please select a column");
            return;
        }

        try {
            if (task) {
                // Update existing
                await onUpdate(task.id, {
                    title,
                    description,
                    priority,
                    dueDate: dueDate ? dueDate.toDateString() : undefined,
                });

                if (columnId !== task.columnId) {
                    await onMoveTask(task.id, columnId);
                }
            } else {
                // Create new
                await onCreate({
                    title,
                    description,
                    priority,
                    dueDate: dueDate ? dueDate.toDateString() : undefined,
                    columnId,
                });
            }

            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            // You might want to show an error message to the user
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await onDelete(task.id);
                onClose();
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] grid-rows-[auto_1fr_auto] p-0 gap-0 overflow-hidden bg-card">
                {/* Header / Title Area */}
                <div className="pt-6 pl-6 pb-4 pr-12 border-b">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task title"
                        className="text-2xl font-bold tracking-tight border-none shadow-sm bg-muted/30 hover:bg-muted/40 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:shadow-sm px-3 py-2 h-auto rounded-xl transition-all duration-200 placeholder:text-muted-foreground/40"
                        autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            in list
                            <Select value={columnId} onValueChange={setColumnId}>
                                <SelectTrigger className="h-7 border-none shadow-none bg-transparent hover:bg-muted p-0 px-2 gap-1 text-foreground font-medium w-auto focus:ring-0">
                                    <SelectValue placeholder="Column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {columns.map((col) => {
                                        const board = boards?.find(b => b.id === col.boardId);
                                        return (
                                            <SelectItem key={col.id} value={col.id}>
                                                {col.title} {board ? <span className="text-muted-foreground ml-1">({board.title})</span> : ""}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </span>
                    </div>
                </div>

                {/* Main Content Area - Scrollable */}
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] overflow-y-auto min-h-0">
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                                <LayoutList className="h-4 w-4" />
                                Description
                            </div>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more detailed description..."
                                className="resize-none min-h-[150px] border-none bg-muted/30 focus-visible:ring-0 p-3"
                            />
                        </div>
                    </div>

                    {/* Sidebar / Metadata Area */}
                    <div className="bg-muted/30 p-4 space-y-6 border-l">
                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Tag className="h-3 w-3" /> Priority
                            </label>
                            <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                                <SelectTrigger className="w-full bg-background border-none shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Low
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500" /> Medium
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="high">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500" /> High
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Due Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-background shadow-sm pl-3 border",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                        {dueDate ? format(dueDate, "PP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <DialogFooter className="p-4 border-t bg-muted/10 flex justify-between items-center">
                    {task ? (
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : <div />}

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>
                            {task ? "Save Changes" : "Create Task"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
