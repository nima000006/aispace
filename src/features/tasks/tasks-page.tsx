"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Plus, GripVertical, MoreHorizontal, Trash2, Edit,
  CheckSquare, Clock, AlertCircle, XCircle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const COLUMNS: { id: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { id: "todo", label: "To Do", icon: Clock, color: "text-blue-500" },
  { id: "in_progress", label: "In Progress", icon: AlertCircle, color: "text-amber-500" },
  { id: "done", label: "Done", icon: CheckSquare, color: "text-emerald-500" },
  { id: "cancelled", label: "Cancelled", icon: XCircle, color: "text-[var(--muted-fg)]" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
  urgent: "destructive",
} as any;

export function TasksPage() {
  const t = useTranslations("tasks");
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      status: newStatus,
      priority: newPriority,
      subtasks: [],
      tags: [],
    });
    setNewTitle("");
    setShowForm(false);
    toast.success("Task created");
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) {
      moveTask(draggedId, status);
      setDraggedId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--fg)]">{t("title")}</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            {tasks.filter((t) => t.status !== "done").length} active tasks
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-1.5 self-start sm:self-auto shrink-0">
          <Plus className="w-4 h-4" />
          {t("newTask")}
        </Button>
      </div>

      {/* New task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-48">
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                      Task title *
                    </label>
                    <Input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      placeholder="What needs to be done?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                      className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 text-sm text-[var(--fg)] focus:outline-none"
                    >
                      {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                      Column
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                      className="h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 text-sm text-[var(--fg)] focus:outline-none"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button variant="gradient" size="sm" onClick={handleAdd}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="grid grid-cols-4 gap-3 md:gap-4 min-w-[640px] md:min-w-0">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <Icon className={cn("w-4 h-4", col.color)} />
                <span className="text-sm font-semibold text-[var(--fg)]">{col.label}</span>
                <span className="ms-auto text-xs text-[var(--muted-fg)] bg-[var(--muted-bg)] px-1.5 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Drop zone */}
              <div className={cn(
                "min-h-24 rounded-xl border-2 border-dashed transition-colors p-2 space-y-2",
                draggedId
                  ? "border-[var(--primary)] bg-[var(--accent-bg)]"
                  : "border-[var(--card-border)] bg-[var(--muted-bg)]"
              )}>
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-16">
                    <p className="text-xs text-[var(--muted-fg)]">Drop tasks here</p>
                  </div>
                )}
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={() => setDraggedId(task.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onDelete={() => {
                      deleteTask(task.id);
                      toast.success("Task deleted");
                    }}
                    onStatusChange={(s) => moveTask(task.id, s)}
                  />
                ))}
              </div>

              {/* Add to column */}
              <button
                onClick={() => {
                  setNewStatus(col.id);
                  setShowForm(true);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--muted-bg)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add task
              </button>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onStatusChange: (s: TaskStatus) => void;
}) {
  const PRIORITY_BADGE_MAP: Record<TaskPriority, "secondary" | "warning" | "destructive"> = {
    low: "secondary",
    medium: "warning",
    high: "destructive",
    urgent: "destructive",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-3 shadow-sm cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-[var(--card-border)] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--fg)] leading-snug line-clamp-2">
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--muted-fg)] mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge variant={PRIORITY_BADGE_MAP[task.priority]} className="text-[10px]">
              {task.priority}
            </Badge>
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-[var(--muted-fg)] hover:text-[var(--destructive)] transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
