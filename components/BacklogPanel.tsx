"use client";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { TaskInlineCreator } from "./TaskInlineCreator";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDnd } from "@/context/dnd";

interface Props {
  className?: string;
}

export function BacklogPanel({ className }: Props) {
  const { tasks, updateTask } = useTasks();
  const { dragging, endDrag } = useDnd();
  const [showCreator, setShowCreator] = useState(true);
  const backlog = tasks.filter((t) => !t.scheduledDate);
  const scheduledButPending = tasks.filter((t) => t.scheduledDate && t.status !== "done");

  return (
    <aside className={cn("flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-900", className)}>
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-300">
          Backlog
        </h3>
      </div>
      <div
        className="px-3 pb-3 pt-1 space-y-2 overflow-y-auto min-h-0 flex-1"
        onDragOver={(e) => {
          if (dragging?.type === "task") e.preventDefault();
        }}
        onDrop={(e) => {
          if (dragging?.type === "task") {
            e.preventDefault();
            updateTask(dragging.taskId, { scheduledDate: undefined, scheduledTime: undefined });
            endDrag();
          }
        }}
      >
        {showCreator && <TaskInlineCreator placeholder="Agregar al backlog…" />}
        {backlog.length === 0 && (
          <p className="text-xs text-neutral-400">Sin tareas pendientes en backlog.</p>
        )}
        {backlog
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((t) => (
            <TaskCard key={t.id} task={t} variant="backlog" />
          ))}
        {scheduledButPending.length > 0 && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Programadas</p>
            {scheduledButPending.map((t) => (
              <TaskCard key={t.id} task={t} variant="backlog" compact className="mb-1" />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
