import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useKanban } from "@/context/KanbanContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, Plus, Search, Layers, Grid3x3, List, MoreVertical,
  CheckCircle, AlertCircle,
  FolderOpen, CheckSquare, Star, User, Settings, LogOut, X, ChevronRight,
  Trash2, Edit2
} from "lucide-react";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [editingBoard, setEditingBoard] = useState<{ id: string, title: string, description: string } | null>(null);

  const [taskFilter, setTaskFilter] = useState<"all" | "due_soon" | "overdue" | "today">("all");

  // Memoize 'now' to avoid impure render warnings
  const now = useMemo(() => new Date(), []);

  const {
    boards, tasks, columns, getBoardTasks, getBoardColumns,
    addBoard, toggleBoardStar, updateBoard, deleteBoard, moveTask
  } = useKanban();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalTasks = tasks.length;
  const activeBoards = boards.length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    addBoard({
      title: newBoardTitle,
      description: newBoardDesc,
      color: "bg-blue-500",
    });
    setShowCreateBoard(false);
    setNewBoardTitle("");
    setNewBoardDesc("");
  };

  const handleRenameBoard = () => {
    if (!editingBoard || !editingBoard.title.trim()) return;
    updateBoard(editingBoard.id, {
      title: editingBoard.title,
      description: editingBoard.description
    });
    setEditingBoard(null);
  }

  const handleDeleteBoard = (boardId: string) => {
    if (confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      deleteBoard(boardId);
    }
  }

  const handleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentColumn = columns.find(c => c.id === task.columnId);
    if (!currentColumn) return;

    const boardColumns = getBoardColumns(currentColumn.boardId);
    const doneColumn = boardColumns.find(c => ['done', 'completed', 'finished'].includes(c.title.toLowerCase()));

    if (doneColumn) {
      moveTask(taskId, doneColumn.id);
    } else {
      const lastColumn = boardColumns[boardColumns.length - 1];
      if (lastColumn) {
        moveTask(taskId, lastColumn.id);
      }
    }
  };

  const totalCompletion = useMemo(() => {
    if (tasks.length === 0) return 0;
    const doneColumnIds = columns
      .filter(c => ['done', 'completed', 'finished'].includes(c.title.toLowerCase()))
      .map(c => c.id);
    const doneTasks = tasks.filter(t => doneColumnIds.includes(t.columnId));
    return Math.round((doneTasks.length / tasks.length) * 100);
  }, [tasks, columns]);

  const lastViewedBoard = useMemo(() => {
    if (boards.length === 0) return null;
    return [...boards].sort((a, b) => (b.lastViewed || 0) - (a.lastViewed || 0))[0];
  }, [boards]);

  const dueSoonCount = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const column = columns.find(c => c.id === t.columnId);
      const isDone = column && ['done', 'completed', 'finished'].includes(column.title.toLowerCase());
      if (isDone) return false;
      return new Date(t.dueDate) > now && new Date(t.dueDate) < new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    }).length;
  }, [tasks, columns, now]);

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => setTaskFilter("all")
    },
    {
      label: "Active Boards",
      value: activeBoards,
      icon: FolderOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      action: () => document.getElementById("boards-section")?.scrollIntoView({ behavior: "smooth" })
    },
    {
      label: "Due Soon",
      value: dueSoonCount,
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      action: () => setTaskFilter("due_soon")
    },
    {
      label: "Completion",
      value: `${totalCompletion}%`,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      action: () => { }
    }
  ];

  const getBoardProgress = (boardId: string) => {
    const boardTasks = getBoardTasks(boardId);
    const boardColumns = getBoardColumns(boardId);
    if (boardTasks.length === 0) return 0;

    const doneColumnIds = boardColumns
      .filter(c => ['done', 'completed', 'finished'].includes(c.title.toLowerCase()))
      .map(c => c.id);

    if (doneColumnIds.length === 0) return 0;

    const doneTasks = boardTasks.filter(t => doneColumnIds.includes(t.columnId));
    return Math.round((doneTasks.length / boardTasks.length) * 100);
  };

  const filteredBoards = boards.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredBoardsByTab = (tab: string) => {
    switch (tab) {
      case "recent":
        return [...filteredBoards].sort((a, b) => (b.lastViewed || 0) - (a.lastViewed || 0)).slice(0, 5);
      case "starred":
        return filteredBoards.filter(b => b.isStarred);
      default:
        return filteredBoards;
    }
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((now.getTime() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                KanbanFlow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search boards or tasks..."
                className="w-[200px] lg:w-[300px] pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          {lastViewedBoard && (
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20"
              onClick={() => navigate(`/board/${lastViewedBoard.id}`)}
            >
              <Layers className="h-5 w-5" />
              Continue Working
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="hover:scale-[1.02] transition-transform cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              onClick={stat.action}
              tabIndex={0}
              role="button"
            >
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
              {stat.label === "Completion" && (
                <div className="px-6 pb-4">
                  <Progress value={parseInt(stat.value.toString())} className="h-1.5" />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8" id="boards-section">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">My Boards</h2>
                  <p className="text-sm text-muted-foreground">Recent projects you are working on</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowCreateBoard(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Board
                  </Button>
                  <div className="h-6 w-px bg-border mx-2" />
                  <Button
                    variant={activeView === "grid" ? "ghost" : "ghost"}
                    size="icon"
                    className={activeView === "grid" ? "bg-muted" : ""}
                    onClick={() => setActiveView("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeView === "list" ? "ghost" : "ghost"}
                    size="icon"
                    className={activeView === "list" ? "bg-muted" : ""}
                    onClick={() => setActiveView("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-muted/50 w-full justify-start rounded-lg p-1 h-auto">
                  <TabsTrigger value="all" className="rounded-md px-4 py-2">All Boards</TabsTrigger>
                  <TabsTrigger value="recent" className="rounded-md px-4 py-2">Recent</TabsTrigger>
                  <TabsTrigger value="starred" className="rounded-md px-4 py-2">Starred</TabsTrigger>
                </TabsList>

                {["all", "recent", "starred"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6">
                    {activeView === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getFilteredBoardsByTab(tab).map((board) => {
                          const boardTasks = getBoardTasks(board.id);
                          const taskCount = boardTasks.length;
                          const progress = getBoardProgress(board.id);

                          return (
                            <Card key={board.id} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden">
                              <Link to={`/board/${board.id}`} className="block h-full">
                                <CardContent className="p-5 h-full flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className={`h-8 w-8 rounded-lg ${board.color} bg-opacity-20 flex items-center justify-center`}>
                                        <Layers className={`h-4 w-4 text-foreground`} />
                                      </div>
                                      <div onClick={(e) => e.preventDefault()}>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingBoard(board)}>
                                              <Edit2 className="mr-2 h-4 w-4" />
                                              Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              className="text-red-600"
                                              onClick={() => handleDeleteBoard(board.id)}
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{board.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{board.description}</p>
                                  </div>

                                  <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{taskCount} tasks</span>
                                      <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5" />
                                    <p className="text-xs text-muted-foreground text-right">{formatTime(board.lastUpdated)}</p>
                                  </div>
                                </CardContent>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-4 right-2 h-8 w-8 z-10 hover:bg-background/80"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleBoardStar(board.id);
                                }}
                              >
                                <Star className={`h-4 w-4 ${board.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}`} />
                              </Button>
                            </Card>
                          );
                        })}
                        {tab === 'all' && getFilteredBoardsByTab(tab).length === 0 && (
                          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>No boards found.</p>
                            <Button variant="link" onClick={() => setShowCreateBoard(true)}>Create one?</Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getFilteredBoardsByTab(tab).map((board) => {
                          const boardTasks = getBoardTasks(board.id);
                          const taskCount = boardTasks.length;
                          const progress = getBoardProgress(board.id);
                          return (
                            <div key={board.id} className="relative group">
                              <Link to={`/board/${board.id}`} className="block">
                                <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg ${board.color} bg-opacity-20 flex items-center justify-center`}>
                                      <Layers className="h-5 w-5 opacity-80" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{board.title}</p>
                                      <p className="text-sm text-muted-foreground">{board.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="w-32 hidden sm:block">
                                      <Progress value={progress} className="h-2" />
                                    </div>
                                    <div className="text-right w-24">
                                      <p className="text-sm font-medium">{taskCount} tasks</p>
                                      <p className="text-xs text-muted-foreground">{formatTime(board.lastUpdated)}</p>
                                    </div>
                                    <div className="flex items-center" onClick={(e) => e.preventDefault()}>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => toggleBoardStar(board.id)}
                                      >
                                        <Star className={`h-4 w-4 ${board.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => setEditingBoard(board)}>
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Rename
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => handleDeleteBoard(board.id)}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col h-full max-h-[800px]">
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Upcoming Tasks
                      {taskFilter !== 'all' && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {taskFilter.replace('_', ' ')}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {taskFilter === 'all' ? "Prioritized for you" : `Filtered by ${taskFilter.replace('_', ' ')}`}
                    </CardDescription>
                  </div>
                  {taskFilter !== 'all' && (
                    <Button variant="ghost" size="sm" onClick={() => setTaskFilter('all')} className="h-6 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="divide-y">
                  {tasks
                    .filter(t => {
                      // Global Search Filtering
                      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false;
                      }

                      if (!t.dueDate) return false;
                      const due = new Date(t.dueDate);

                      const column = columns.find(c => c.id === t.columnId);
                      const isDone = column && ['done', 'completed', 'finished'].includes(column.title.toLowerCase());

                      if (isDone) return false;

                      const isOverdue = due < now;
                      const isToday = due.getDate() === now.getDate() && due.getMonth() === now.getMonth();
                      const isSoon = due > now && due.getTime() - now.getTime() < 2 * 24 * 60 * 60 * 1000;

                      if (taskFilter === 'overdue') return isOverdue;
                      if (taskFilter === 'today') return isToday;
                      if (taskFilter === 'due_soon') return isSoon;
                      return true;
                    })
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                    .slice(0, 10)
                    .map((task, index) => {
                      const board = boards.find(b => getBoardTasks(b.id).find(t => t.id === task.id));
                      const due = new Date(task.dueDate!);
                      const isOverdue = due < now;
                      const isToday = due.getDate() === now.getDate();

                      return (
                        <div key={index} className="p-4 hover:bg-muted/50 transition-colors group">
                          <div className="flex items-start gap-3">
                            <button
                              className="mt-1 h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center shrink-0"
                              onClick={() => handleTaskCompletion(task.id)}
                              title="Mark as done"
                            >
                              <CheckCircle className="h-3 w-3 text-transparent group-hover:text-green-500" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                {board && (
                                  <Link to={`/board/${board.id}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate">
                                    <Layers className="h-3 w-3" />
                                    {board.title}
                                  </Link>
                                )}
                                <span className="text-muted-foreground/30 text-xs">•</span>
                                <span className={`text-xs font-medium ${isOverdue ? "text-red-500" : isToday ? "text-orange-500" : "text-muted-foreground"}`}>
                                  {isOverdue ? "Overdue" : isToday ? "Today" : new Date(task.dueDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {board && (
                              <Link to={`/board/${board.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {tasks.filter(t => t.dueDate && !columns.find(c => c.id === t.columnId && ['done', 'completed'].includes(c.title.toLowerCase()))).length === 0 && (
                    <div className="p-8 text-center">
                      <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">You're all caught up!</p>
                      <p className="text-xs text-muted-foreground mt-1">No upcoming tasks due.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4 border-t bg-muted/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground text-xs h-8"
                  onClick={() => navigate('/tasks')}
                >
                  View all tasks
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={!!editingBoard} onOpenChange={() => setEditingBoard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
            <DialogDescription>
              Update your board details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                value={editingBoard?.title || ""}
                onChange={(e) => setEditingBoard(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="desc" className="text-sm font-medium">Description</label>
              <Input
                id="desc"
                value={editingBoard?.description || ""}
                onChange={(e) => setEditingBoard(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBoard(null)}>Cancel</Button>
            <Button onClick={handleRenameBoard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>
              Add a new board to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="boardName" className="text-sm font-medium">Board Name</label>
              <Input
                id="boardName"
                placeholder="e.g., Marketing Campaign"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="boardDesc" className="text-sm font-medium">Description</label>
              <Input
                id="boardDesc"
                placeholder="Description"
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBoard(false)}>Cancel</Button>
            <Button onClick={handleCreateBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}