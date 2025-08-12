"use client";
import { Task } from "@/types/task";
import { Checkbox } from "./ui/Checkbox";
import { cn } from "@/lib/utils";
import { format, differenceInCalendarDays, isPast, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useTasks } from "@/hooks/useTasks";
import { useDnd } from "@/context/dnd";
import { X, Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Props {
  task: Task;
  variant?: "backlog" | "scheduled";
  compact?: boolean;
  className?: string;
  suppressScheduledStamp?: boolean;
}

export function TaskCard({
  task,
  variant = "backlog",
  compact,
  className,
  suppressScheduledStamp,
}: Props) {
  const { updateTask, deleteTask } = useTasks();
  const [showDuePicker, setShowDuePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { startDrag, endDrag, dragging } = useDnd();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const due = task.dueDate ? parseISO(task.dueDate) : null;
  const today = new Date();
  const daysLeft = due ? differenceInCalendarDays(due, today) : null;
  const dueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const overdue = due ? isPast(due) && daysLeft !== 0 : false;

  const onDragStart = (e: React.DragEvent) => {
    if (editing) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    startDrag({
      type: "task",
      taskId: task.id,
      from: { date: task.scheduledDate || null, time: task.scheduledTime || null },
    });
    // Drag image compacta
    const ghost = document.createElement("div");
    ghost.textContent = task.title;
    ghost.style.cssText =
      "position:fixed;top:-1000px;left:-1000px;max-width:220px;padding:4px 8px;font-size:12px;font-weight:500;border-radius:6px;background:#2563eb;color:white;box-shadow:0 4px 10px rgba(0,0,0,0.25);white-space:nowrap;pointer-events:none;font-family:inherit;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(
      ghost,
      Math.min(ghost.clientWidth, 220) / 2,
      ghost.clientHeight / 2
    );
    setTimeout(() => {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 0);
  };
  const onDragEnd = () => endDrag();
  const isDragging = dragging?.taskId === task.id;
  useEffect(() => {
    if (editing) {
      setDraft(task.title);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, task.title]);

  function commitEdit() {
    const title = draft.trim();
    if (title && title !== task.title) updateTask(task.id, { title });
    setEditing(false);
  }
  function cancelEdit() {
    setDraft(task.title);
    setEditing(false);
  }

  useEffect(() => {
    if (!showDuePicker) return;
    function onDoc(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDuePicker(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showDuePicker]);

  function handleDueChange(val: string) {
    updateTask(task.id, { dueDate: val || undefined });
  }

  return (
    <div
      draggable={!editing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-md border border-neutral-200/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800 shadow-subtle px-2 py-1.5 flex gap-2 text-sm hover:border-brand-300 dark:hover:border-brand-600 cursor-grab active:cursor-grabbing select-none focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-0",
        task.status === "done" && "bg-brand-50 opacity-60 line-through",
        variant === "scheduled" && "dark:bg-neutral-800",
        (dueSoon || overdue) && "pr-8",
        isDragging && "opacity-40",
        editing && "cursor-text",
        className
      )}
      tabIndex={0}
      onDoubleClick={() => setEditing(true)}
    >
      <Checkbox
        checked={task.status === "done"}
        onClick={() => updateTask(task.id, { status: task.status === "done" ? "pending" : "done" })}
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitEdit();
            }}
            className="min-w-0"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                } else if (e.key === "Enter") {
                  commitEdit();
                }
              }}
              className="w-full bg-transparent dark:bg-transparent rounded px-1 py-0.5 text-sm border border-transparent focus:outline-none focus:ring-0"
            />
          </form>
        ) : (
          <div className="font-medium truncate" title={task.title}>
            {task.title}
          </div>
        )}
        {task.description && !compact && (
          <div className="text-xs text-neutral-500 line-clamp-2 whitespace-pre-wrap break-words">
            {task.description}
          </div>
        )}
        {variant === "backlog" && task.scheduledDate && !suppressScheduledStamp && (
          <div className="text-[10px] uppercase tracking-wide text-neutral-400 mt-0.5">
            Programada {format(parseISO(task.scheduledDate), "EEE d", { locale: es })}
            {task.scheduledTime && ` ${task.scheduledTime}`}
          </div>
        )}
      </div>
      {dueSoon && (
        <span className="absolute top-1 right-1 text-[10px] px-1 rounded bg-amber-200 text-amber-950 font-medium">
          {daysLeft === 0 ? "Hoy" : `-${daysLeft}d`}
        </span>
      )}
      {overdue && (
        <span className="absolute top-1 right-1 text-[10px] px-1 rounded bg-red-500 text-white font-medium">
          Vencida
        </span>
      )}
      <div
        className={cn(
          "absolute transition-opacity top-0 right-0 translate-y-[-50%] flex gap-1 pr-1",
          editing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <button
          onClick={() => deleteTask(task.id)}
          aria-label="Eliminar"
          className="h-5 w-5 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 hover:text-red-600 hover:border-red-400"
        >
          <X className="h-3 w-3" />
        </button>
        <button
          onClick={() => setShowDuePicker((s) => !s)}
          aria-label="Vencimiento"
          className={cn(
            "h-5 w-5 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-500 hover:text-brand-600",
            dueSoon && "border-amber-400 text-amber-600",
            overdue && "border-red-500 text-red-600"
          )}
        >
          <Calendar className="h-3 w-3" />
        </button>
      </div>
      {showDuePicker && (
        <div
          ref={pickerRef}
          className="absolute z-50 top-full right-0 mt-1 p-2 rounded-md border bg-white dark:bg-neutral-800 shadow-lg w-52 text-xs space-y-2"
        >
          <div className="font-medium text-neutral-600 dark:text-neutral-300">Vencimiento</div>
          <input
            type="date"
            value={task.dueDate || ""}
            onChange={(e) => handleDueChange(e.target.value)}
            className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {task.dueDate && (
            <button
              type="button"
              onClick={() => handleDueChange("")}
              className="text-[10px] text-neutral-500 hover:text-red-600 hover:underline"
            >
              Quitar fecha
            </button>
          )}
        </div>
      )}
    </div>
  );
}
