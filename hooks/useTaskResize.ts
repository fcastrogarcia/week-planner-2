"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Task } from "@/types/task";

interface Options {
  tasks: Task[];
  updateTask: (id: string, patch: Partial<Task>) => void;
  hoursStart: number; // e.g., 7
  hoursLength: number; // e.g., 17
  slotHeightPx?: number; // default 40
}

interface ResizingState {
  taskId: string;
  startIndex: number;
  rowStart: number;
  initialSpan: number;
  currentSpan: number;
}

export function useTaskResize({
  tasks,
  updateTask,
  hoursStart,
  hoursLength,
  slotHeightPx = 40,
}: Options) {
  const totalSlots = hoursLength * 2;
  const [resizing, setResizing] = useState<ResizingState | null>(null);
  const session = useRef<{
    startY: number;
    initialSpan: number;
    currentSpan: number;
    startIndex: number;
    taskId: string;
  } | null>(null);

  const parseStartIndex = useCallback(
    (scheduledTime: string | undefined) => {
      if (!scheduledTime) return { startIndex: 0, rowStart: 2 };
      const [hh, mmStr] = scheduledTime.split(":");
      const hour = parseInt(hh, 10);
      const minute = parseInt(mmStr, 10);
      let startIndex = (hour - hoursStart) * 2 + (minute >= 30 ? 1 : 0);
      if (startIndex < 0) startIndex = 0;
      if (startIndex > totalSlots - 1) startIndex = totalSlots - 1;
      const rowStart = 2 + startIndex;
      return { startIndex, rowStart };
    },
    [hoursStart, totalSlots]
  );

  const computeRowPlacement = useCallback(
    (t: Task) => {
      const { startIndex, rowStart } = parseStartIndex(t.scheduledTime);
      const baseSpan = Math.max(1, Math.ceil(((t.durationMin ?? 30) as number) / 30));
      const maxSpan = totalSlots - startIndex;
      const span = Math.min(resizing?.taskId === t.id ? resizing.currentSpan : baseSpan, maxSpan);
      return { rowStart, rowSpan: span };
    },
    [parseStartIndex, resizing, totalSlots]
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, taskId: string, scheduledTime: string) => {
      e.preventDefault();
      e.stopPropagation();
      const t = tasks.find((t) => t.id === taskId);
      const { startIndex, rowStart } = parseStartIndex(scheduledTime);
      const initialSpan = Math.max(1, Math.ceil(((t?.durationMin ?? 30) as number) / 30));
      setResizing({ taskId, startIndex, rowStart, initialSpan, currentSpan: initialSpan });
      session.current = {
        startY: (e as React.MouseEvent).clientY,
        initialSpan,
        currentSpan: initialSpan,
        startIndex,
        taskId,
      };

      const onMove = (ev: MouseEvent) => {
        if (!session.current) return;
        const dy = ev.clientY - session.current.startY;
        const deltaSlots = Math.round(dy / slotHeightPx);
        const span = Math.max(
          1,
          Math.min(
            totalSlots - session.current.startIndex,
            session.current.initialSpan + deltaSlots
          )
        );
        session.current.currentSpan = span;
        setResizing((r) => (r && r.taskId === taskId ? { ...r, currentSpan: span } : r));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        const finalSpan = session.current?.currentSpan ?? initialSpan;
        setResizing(null);
        session.current = null;
        updateTask(taskId, { durationMin: finalSpan * 30 });
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseup", onUp, { passive: true });
    },
    [parseStartIndex, tasks, totalSlots, slotHeightPx, updateTask]
  );

  useEffect(() => {
    return () => {
      window.onmousemove = null;
      window.onmouseup = null;
    };
  }, []);

  return { resizing, onResizeMouseDown, computeRowPlacement } as const;
}
