"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Plus, Trash2, Edit2, LogOut, Check, X, 
  FileText, Calendar, PlusCircle, User, Loader2, GripVertical
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: string;
}

interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

interface Board {
  id: string;
  name: string;
  userId: string;
  columns?: Column[];
}

interface BoardClientProps {
  initialBoards: Board[];
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function BoardClient({ initialBoards, user }: BoardClientProps) {
  const router = useRouter();

  // State
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [activeBoardId, setActiveBoardId] = useState<string>(
    initialBoards.length > 0 ? initialBoards[0].id : ""
  );
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [tempBoardName, setTempBoardName] = useState("");

  const [creatingColumn, setCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempColumnName, setTempColumnName] = useState("");

  // Task creation/editing state
  const [activeTaskColumnId, setActiveTaskColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");

  // Fetch active board details
  useEffect(() => {
    if (!activeBoardId) {
      setActiveBoard(null);
      return;
    }

    const fetchBoardDetails = async () => {
      setLoadingBoard(true);
      try {
        const res = await fetch(`/api/boards?boardId=${activeBoardId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveBoard(data);
        }
      } catch (err) {
        console.error("Error fetching board details:", err);
      } finally {
        setLoadingBoard(false);
      }
    };

    fetchBoardDetails();
  }, [activeBoardId]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  // Board CRUD
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBoardName }),
      });

      if (res.ok) {
        const created = await res.json();
        setBoards([created, ...boards]);
        setActiveBoardId(created.id);
        setNewBoardName("");
        setCreatingBoard(false);
      }
    } catch (err) {
      console.error("Error creating board:", err);
    }
  };

  const handleUpdateBoardName = async () => {
    if (!activeBoard || !tempBoardName.trim() || tempBoardName === activeBoard.name) {
      setEditingBoardName(false);
      return;
    }

    // Optimistic Update
    const prevName = activeBoard.name;
    setActiveBoard({ ...activeBoard, name: tempBoardName });
    setBoards(boards.map(b => b.id === activeBoard.id ? { ...b, name: tempBoardName } : b));
    setEditingBoardName(false);

    try {
      const res = await fetch("/api/boards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: activeBoard.id, name: tempBoardName }),
      });

      if (!res.ok) throw new Error();
    } catch (err) {
      // Revert on error
      setActiveBoard(prev => prev ? { ...prev, name: prevName } : null);
      setBoards(boards.map(b => b.id === activeBoard.id ? { ...b, name: prevName } : b));
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoard || !confirm("¿Estás seguro de que quieres eliminar este tablero y todas sus tareas?")) return;

    const boardIdToDelete = activeBoard.id;
    // Optimistic UI update
    const updatedBoards = boards.filter(b => b.id !== boardIdToDelete);
    setBoards(updatedBoards);
    setActiveBoardId(updatedBoards.length > 0 ? updatedBoards[0].id : "");
    setActiveBoard(null);

    try {
      const res = await fetch(`/api/boards?boardId=${boardIdToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Reload on error to sync state
      router.refresh();
    }
  };

  // Column CRUD
  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim() || !activeBoard) return;

    try {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: activeBoard.id, name: newColumnName }),
      });

      if (res.ok) {
        const created = await res.json();
        setActiveBoard({
          ...activeBoard,
          columns: [...(activeBoard.columns || []), { ...created, tasks: [] }],
        });
        setNewColumnName("");
        setCreatingColumn(false);
      }
    } catch (err) {
      console.error("Error creating column:", err);
    }
  };

  const handleUpdateColumnName = async (columnId: string) => {
    if (!activeBoard || !tempColumnName.trim()) {
      setEditingColumnId(null);
      return;
    }

    // Optimistic Update
    const prevColumns = activeBoard.columns || [];
    setActiveBoard({
      ...activeBoard,
      columns: prevColumns.map(c => c.id === columnId ? { ...c, name: tempColumnName } : c),
    });
    setEditingColumnId(null);

    try {
      const res = await fetch("/api/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, name: tempColumnName }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setActiveBoard(prev => prev ? { ...prev, columns: prevColumns } : null);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!activeBoard || !confirm("¿Eliminar esta columna y todas sus tareas?")) return;

    const prevColumns = activeBoard.columns || [];
    setActiveBoard({
      ...activeBoard,
      columns: prevColumns.filter(c => c.id !== columnId),
    });

    try {
      const res = await fetch(`/api/columns?columnId=${columnId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setActiveBoard(prev => prev ? { ...prev, columns: prevColumns } : null);
    }
  };

  // Task CRUD
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeTaskColumnId || !activeBoard) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: activeTaskColumnId,
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setActiveBoard({
          ...activeBoard,
          columns: (activeBoard.columns || []).map(col => {
            if (col.id === activeTaskColumnId) {
              return { ...col, tasks: [...col.tasks, created] };
            }
            return col;
          }),
        });

        setNewTaskTitle("");
        setNewTaskDescription("");
        setActiveTaskColumnId(null);
      }
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTaskTitle.trim() || !activeBoard) return;

    const prevColumns = activeBoard.columns || [];
    // Optimistic Update
    setActiveBoard({
      ...activeBoard,
      columns: prevColumns.map(col => {
        if (col.id === selectedTask.columnId) {
          return {
            ...col,
            tasks: col.tasks.map(t =>
              t.id === selectedTask.id
                ? { ...t, title: editTaskTitle, description: editTaskDescription }
                : t
            ),
          };
        }
        return col;
      }),
    });

    const taskId = selectedTask.id;
    setSelectedTask(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          title: editTaskTitle,
          description: editTaskDescription,
        }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setActiveBoard(prev => prev ? { ...prev, columns: prevColumns } : null);
    }
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    if (!activeBoard || !confirm("¿Seguro que quieres eliminar esta tarea?")) return;

    const prevColumns = activeBoard.columns || [];
    setActiveBoard({
      ...activeBoard,
      columns: prevColumns.map(col => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
        return col;
      }),
    });
    setSelectedTask(null);

    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setActiveBoard(prev => prev ? { ...prev, columns: prevColumns } : null);
    }
  };

  // NATIVE HTML5 DRAG & DROP
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.setData("sourceColumnId", sourceColumnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropTask = async (e: React.DragEvent, targetColumnId: string, hoverIndex?: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    if (!taskId || !activeBoard) return;

    // Retrieve active columns
    const columns = activeBoard.columns ? [...activeBoard.columns] : [];

    // Find the task inside source column
    const sourceColumn = columns.find(c => c.id === sourceColumnId);
    if (!sourceColumn) return;

    const taskToMove = sourceColumn.tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    // Check if anything actually changed
    const targetColumn = columns.find(c => c.id === targetColumnId);
    if (!targetColumn) return;

    // Clone columns optimistically
    const updatedColumns = columns.map(col => {
      // Remove task from source column
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId),
        };
      }
      return col;
    });

    // Add task to target column
    const updatedTargetColumn = updatedColumns.find(c => c.id === targetColumnId);
    if (!updatedTargetColumn) return;

    // Insert task at specific index if dropped over another card, otherwise push to end
    const updatedTask = { ...taskToMove, columnId: targetColumnId };
    
    if (hoverIndex !== undefined) {
      updatedTargetColumn.tasks.splice(hoverIndex, 0, updatedTask);
    } else {
      updatedTargetColumn.tasks.push(updatedTask);
    }

    // Re-calculate positions for source and target tasks
    const sourceTasksWithPositions = updatedColumns
      .find(c => c.id === sourceColumnId)!
      .tasks.map((t, idx) => ({ ...t, position: idx }));
      
    const targetTasksWithPositions = updatedTargetColumn.tasks.map((t, idx) => ({
      ...t,
      position: idx,
    }));

    // Update board state optimistically
    const finalColumns = updatedColumns.map(col => {
      if (col.id === sourceColumnId) {
        return { ...col, tasks: sourceTasksWithPositions };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: targetTasksWithPositions };
      }
      return col;
    });

    setActiveBoard({ ...activeBoard, columns: finalColumns });

    // Prepare API updates
    // Combine affected tasks to update bulk positions in one request
    const tasksToSync = [
      ...sourceTasksWithPositions.map(t => ({ id: t.id, position: t.position, columnId: sourceColumnId })),
      ...targetTasksWithPositions.map(t => ({ id: t.id, position: t.position, columnId: targetColumnId })),
    ];

    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksToSync }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      // Revert state on fetch failure
      setActiveBoard(activeBoard);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-slate-100">
      
      {/* Top Navbar */}
      <header className="w-full glass-panel border-b border-white/5 py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 z-40">
        
        {/* Branding & Board Selector */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-indigo-500" />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              FlowKanban
            </span>
          </div>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          {/* Board Selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <select
              value={activeBoardId}
              onChange={(e) => setActiveBoardId(e.target.value)}
              className="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 max-w-[200px]"
            >
              {boards.length === 0 ? (
                <option value="">Sin Tableros</option>
              ) : (
                boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => setCreatingBoard(true)}
              className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
              title="Crear Nuevo Tablero"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200">{user.name || "Usuario"}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 flex flex-col p-6 relative overflow-hidden">
        
        {/* Active Board Header Operations */}
        {activeBoard && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {editingBoardName ? (
                <div className="flex items-center gap-2 bg-slate-900/40 p-1 border border-white/10 rounded-xl">
                  <input
                    type="text"
                    value={tempBoardName}
                    onChange={(e) => setTempBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateBoardName()}
                    className="bg-transparent text-lg md:text-2xl font-bold focus:outline-none px-2 py-0.5 text-slate-200"
                    autoFocus
                  />
                  <button onClick={handleUpdateBoardName} className="p-1 hover:text-emerald-400 text-slate-400">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={() => setEditingBoardName(false)} className="p-1 hover:text-red-400 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="text-lg md:text-2xl font-extrabold tracking-tight text-white">
                    {activeBoard.name}
                  </h1>
                  <button
                    onClick={() => {
                      setTempBoardName(activeBoard.name);
                      setEditingBoardName(true);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleDeleteBoard}
              className="flex items-center gap-1.5 text-xs text-red-500/80 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 py-1.5 px-3 rounded-lg transition-all cursor-pointer font-semibold"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar Tablero</span>
            </button>
          </div>
        )}

        {/* Board Canvas */}
        {loadingBoard ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
            <span className="text-slate-400 text-sm">Cargando tablero...</span>
          </div>
        ) : activeBoard ? (
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start select-none">
            
            {/* Render Columns */}
            {activeBoard.columns?.map((column) => (
              <div
                key={column.id}
                onDragOver={handleDragOverColumn}
                onDrop={(e) => handleDropTask(e, column.id)}
                className="w-[280px] md:w-[320px] shrink-0 bg-slate-900/35 border border-white/5 rounded-2xl p-4 flex flex-col max-h-[70vh] glass-panel"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 group/col">
                  {editingColumnId === column.id ? (
                    <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-white/10 rounded-lg w-full">
                      <input
                        type="text"
                        value={tempColumnName}
                        onChange={(e) => setTempColumnName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateColumnName(column.id)}
                        className="bg-transparent text-sm font-bold focus:outline-none px-1.5 py-0.5 text-slate-200 w-full"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateColumnName(column.id)} className="p-0.5 hover:text-emerald-400 text-slate-400">
                        <Check className="h-4.5 w-4.5" />
                      </button>
                      <button onClick={() => setEditingColumnId(null)} className="p-0.5 hover:text-red-400 text-slate-400">
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span
                        onDoubleClick={() => {
                          setEditingColumnId(column.id);
                          setTempColumnName(column.name);
                        }}
                        className="text-sm font-bold text-slate-200 cursor-pointer hover:text-indigo-400 transition-colors"
                      >
                        {column.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-col-hover/col:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingColumnId(column.id);
                            setTempColumnName(column.name);
                          }}
                          className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tasks List */}
                <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1 min-h-[100px] py-1">
                  {column.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                      onDragOver={(e) => handleDragOverColumn(e)}
                      onDrop={(e) => handleDropTask(e, column.id, index)}
                      onClick={() => {
                        setSelectedTask(task);
                        setEditTaskTitle(task.title);
                        setEditTaskDescription(task.description || "");
                      }}
                      className="bg-[#12192c]/75 border border-white/5 p-4 rounded-xl shadow-md hover:border-indigo-500/40 hover:shadow-indigo-500/5 cursor-grab active:cursor-grabbing transition-all group/task relative"
                    >
                      <div className="absolute top-3.5 right-3 text-slate-600 group-task-hover/task:text-slate-400 transition-colors">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mb-1.5 pr-4 line-clamp-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed mb-2.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  {column.tasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-xl text-center">
                      <span className="text-[10px] text-slate-600">Sin tareas</span>
                    </div>
                  )}
                </div>

                {/* Add Task Button */}
                <button
                  onClick={() => setActiveTaskColumnId(column.id)}
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/25 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Agregar Tarea</span>
                </button>
              </div>
            ))}

            {/* Create New Column Interface */}
            {creatingColumn ? (
              <form
                onSubmit={handleCreateColumn}
                className="w-[280px] shrink-0 bg-slate-900/35 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 glass-panel"
              >
                <input
                  type="text"
                  placeholder="Nombre de la columna..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                  required
                  autoFocus
                />
                <div className="flex gap-2 text-xs">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-colors"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatingColumn(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setCreatingColumn(true)}
                className="w-[280px] shrink-0 h-[100px] border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 transition-all cursor-pointer font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Nueva Columna</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-3xl text-center glass-panel">
            <FileText className="h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No hay tableros activos</h3>
            <p className="text-slate-500 text-xs mt-1 mb-6 max-w-sm">
              Crea tu primer tablero para comenzar a organizar tus tareas y flujos de trabajo.
            </p>
            <button
              onClick={() => setCreatingBoard(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg cursor-pointer transition-colors text-sm"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Crear Primer Tablero</span>
            </button>
          </div>
        )}
      </main>

      {/* CREATE BOARD MODAL */}
      {creatingBoard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <form
            onSubmit={handleCreateBoard}
            className="w-full max-w-md p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative"
          >
            <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Tablero</h3>
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Nombre del Tablero</label>
                <input
                  type="text"
                  placeholder="Ej. Proyecto Alpha, Ideas, Compras..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Crear Tablero
              </button>
              <button
                type="button"
                onClick={() => setCreatingBoard(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK ADD TASK MODAL */}
      {activeTaskColumnId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative"
          >
            <h3 className="text-lg font-bold text-white mb-4">Agregar Nueva Tarea</h3>
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Título</label>
                <input
                  type="text"
                  placeholder="¿Qué necesitas hacer?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Descripción (Opcional)</label>
                <textarea
                  placeholder="Detalles sobre esta tarea..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Agregar Tarea
              </button>
              <button
                type="button"
                onClick={() => setActiveTaskColumnId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT TASK DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
          <form
            onSubmit={handleUpdateTask}
            className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Detalles de Tarea</h3>
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id, selectedTask.columnId)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer border border-red-500/10 hover:border-red-500/30 bg-red-500/5 px-2.5 py-1 rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar Tarea</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Título</label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Descripción</label>
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="flex gap-3 text-sm">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
