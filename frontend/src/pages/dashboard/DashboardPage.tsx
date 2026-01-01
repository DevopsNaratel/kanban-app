import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Board } from "@/types/kanban";
import { useKanban } from "@/context/KanbanContext";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Star,
  Flame,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  LogOut,
  LayoutGrid,
  List,
  CalendarClock
} from "lucide-react";

export default function DashboardPage() {

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { boards, tasks, columns, addBoard, updateBoard, deleteBoard, getBoardTasks, updateTask, moveTask } = useKanban();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveBoard = () => {
    if (!newBoardTitle.trim()) return;

    if (editingBoard) {
      updateBoard(editingBoard.id, {
        title: newBoardTitle,
        description: newBoardDesc
      });
    } else {
      addBoard({
        title: newBoardTitle,
        description: newBoardDesc,
        color: "bg-blue-500",
        createdAt: new Date().toISOString(),
        progress: 0
      });
    }
    setShowCreateBoard(false);
    setNewBoardTitle("");
    setNewBoardDesc("");
    setEditingBoard(null);
  };

  const openCreateDialog = () => {
    setEditingBoard(null);
    setNewBoardTitle("");
    setNewBoardDesc("");
    setShowCreateBoard(true);
  };

  const openEditDialog = (e: React.MouseEvent, board: Board) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoard(board);
    setNewBoardTitle(board.title);
    setNewBoardDesc(board.description);
    setShowCreateBoard(true);
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this board?")) {
      deleteBoard(boardId);
    }
  };



  const activeBoards = boards.filter(board => !board.completed);

  // Stats Calculations
  const totalTasks = tasks.length;
  // Tasks due in next 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const dueSoonTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= new Date() && d <= sevenDaysFromNow && !t.completed;
  });

  const upcomingTasks = tasks
    .filter(t => {
      if (!t.dueDate || t.completed) return false;
      const column = columns.find(c => c.id === t.columnId);
      if (column && column.title.toLowerCase() === 'done') return false;
      return true;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 7); // Take top 7





  // Filter boards based on active tab




  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-sidebar/50 backdrop-blur-sm hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 font-semibold text-sm tracking-tight text-sidebar-foreground">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-sm">
              <Flame className="h-3.5 w-3.5" />
            </div>
            <span>FlowFocus</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          {/* Minimal User Profile */}
          <div className="p-3 mb-6 flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg border-2 border-background shadow">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2.5 h-10 text-sm font-medium hover:bg-sidebar-accent rounded-lg transition-all"
              onClick={() => navigate('/tasks')}
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Calendar</span>
            </Button>
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 h-10 text-sm font-medium hover:bg-sidebar-accent rounded-lg transition-all text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div> */}
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Personal Dashboard</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border border-border/50 shadow-sm bg-card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Boards</span>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeBoards.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active goals</p>
                </div>
              </Card>

              <Card className="p-4 border border-border/50 shadow-sm bg-card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all boards</p>
                </div>
              </Card>

              <Card className="p-4 border border-border/50 shadow-sm bg-card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Due This Week</span>
                  <CalendarClock className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dueSoonTasks.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Approaching deadlines</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Main Column: Boards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight mb-1">My Boards</h2>
                    <p className="text-sm text-muted-foreground">Manage and track your personal goals</p>
                  </div>
                  <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/20">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-7 px-2.5 text-xs gap-1.5"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-7 px-2.5 text-xs gap-1.5"
                    >
                      <List className="h-3.5 w-3.5" />
                      List
                    </Button>
                  </div>
                </div>

                {/* Boards Display */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Create New Card */}
                    <Card
                      onClick={openCreateDialog}
                      className="h-48 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all group hover:shadow-md"
                    >
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/10 group-hover:to-primary/5 flex items-center justify-center transition-colors mb-3">
                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        New Board
                      </span>
                      <p className="text-xs text-muted-foreground/70 mt-1">Add a new personal goal</p>
                    </Card>

                    {activeBoards.map(board => {
                      const boardTasks = getBoardTasks(board.id);
                      const totalTasks = boardTasks.length;
                      const completedTasks = boardTasks.filter(t => t.completed).length;
                      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                      return (
                        <Link to={`/board/${board.id}`} key={board.id} className="group block relative">
                          <Card className="h-48 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all rounded-xl bg-card p-5 flex flex-col justify-between group-hover:translate-y-[-2px]">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-foreground truncate pr-6">{board.title}</h3>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => openEditDialog(e, board)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteBoard(e, board.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {board.description || "No description provided"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
                                </span>
                              </div>
                              {!board.completed && (
                                <Progress value={progress} className="h-1.5" />
                              )}
                              {board.completed && (
                                <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 py-1 rounded">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Completed
                                </div>
                              )}
                            </div>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBoards.map(board => {
                      const boardTasks = getBoardTasks(board.id);
                      const totalTasks = boardTasks.length;
                      const completedTasks = boardTasks.filter(t => t.completed).length;
                      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                      return (
                        <div key={board.id} className="group relative">
                          <Link to={`/board/${board.id}`} className="block">
                            <Card className="flex flex-row items-center text-left gap-4 p-4 hover:bg-muted/30 transition-all border-border/50 hover:shadow-sm">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Target className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0 pr-8">
                                <h3 className="font-medium truncate text-base">{board.title}</h3>
                                <p className="text-xs text-muted-foreground truncate opacity-80">{board.description || "No description provided"}</p>
                              </div>
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-xs text-muted-foreground w-24 text-right hidden sm:block">
                                  {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
                                </div>
                                <div className="w-24 hidden md:block">
                                  <Progress value={progress} className="h-1.5" />
                                </div>
                              </div>
                              {/* Spacer for button */}
                              <div className="w-8"></div>
                            </Card>
                          </Link>

                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => openEditDialog(e, board)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteBoard(e, board.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                    <Button variant="outline" className="w-full border-dashed gap-2 text-muted-foreground hover:text-primary h-12" onClick={openCreateDialog}>
                      <Plus className="h-4 w-4" />
                      Add Board
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {activeBoards.length === 0 && (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
                      <Star className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No active goals yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start by creating your first Board. What would you like to achieve?
                    </p>
                    <Button onClick={openCreateDialog} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Upcoming Tasks */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h3 className="text-lg font-semibold tracking-tight mb-4">Upcoming Tasks</h3>
                  <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
                    {upcomingTasks.length > 0 ? (
                      <div className="divide-y divide-border/40">
                        {upcomingTasks.map(task => {
                          const column = columns.find(c => c.id === task.columnId);
                          const board = column ? boards.find(b => b.id === column.boardId) : null;

                          const handleCompleteTask = (taskId: string, columnId: string) => {
                            const currentColumn = columns.find(c => c.id === columnId);
                            if (currentColumn) {
                              const doneColumn = columns.find(c => c.boardId === currentColumn.boardId && c.title.toLowerCase() === 'done');
                              if (doneColumn) {
                                moveTask(taskId, doneColumn.id);
                              }
                            }
                            updateTask(taskId, { completed: true });
                          };

                          return (
                            <div key={task.id} className="p-4 hover:bg-muted/20 transition-colors group flex items-start gap-3">
                              <button
                                className="mt-1 h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all flex-shrink-0"
                                onClick={(e) => { e.preventDefault(); handleCompleteTask(task.id, task.columnId); }}
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="h-3 w-3 text-primary opacity-0 hover:opacity-100 transition-opacity" />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <h4 className="text-sm font-medium line-clamp-2 leading-tight">{task.title}</h4>
                                  {task.priority === 'high' && <span className="h-2 w-2 rounded-full bg-red-500 mt-1 flex-shrink-0" title="High Priority" />}
                                </div>

                                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarClock className="h-3 w-3" />
                                    {new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>

                                  {board && (
                                    <div className="px-1.5 py-0.5 rounded-md bg-muted/50 text-[10px] font-medium text-muted-foreground border border-border/50 truncate max-w-[100px]">
                                      {board.title}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground self-center" onClick={() => board && navigate(`/board/${board.id}`)}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No upcoming deadlines</p>
                      </div>
                    )}
                    <div className="bg-muted/20 p-3 border-t border-border/40 text-center">
                      <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => navigate('/tasks')}>
                        View Calendar
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Board Dialog */}
      <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-xl">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingBoard ? "Edit Board" : "New Board"}</DialogTitle>
              <DialogDescription>
                {editingBoard ? "Update your personal goal details" : "Define a personal goal or area you want to focus on"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boardName" className="text-sm font-medium">Goal Name</Label>
                <Input
                  id="boardName"
                  value={newBoardTitle}
                  onChange={e => setNewBoardTitle(e.target.value)}
                  placeholder="e.g., Learn Spanish, Fitness Journey, Read 20 Books"
                  className="h-10"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardDesc" className="text-sm font-medium">Description</Label>
                <Input
                  id="boardDesc"
                  value={newBoardDesc}
                  onChange={e => setNewBoardDesc(e.target.value)}
                  placeholder="Why is this important? What do you want to achieve?"
                  className="h-10"
                />
              </div>

            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button variant="outline" onClick={() => setShowCreateBoard(false)} className="h-9">
              Cancel
            </Button>
            <Button
              onClick={handleSaveBoard}
              className="h-9 gap-2"
              disabled={!newBoardTitle.trim()}
            >
              <Target className="h-4 w-4" />
              {editingBoard ? "Save Changes" : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}