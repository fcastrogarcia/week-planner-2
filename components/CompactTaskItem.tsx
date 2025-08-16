'use client';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  task: Task;
  unscheduled?: boolean;
  className?: string;
  showDescription?: boolean;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [hh, mm] = hhmm.split(':').map(Number);
  const total = hh * 60 + mm + minutes;
  const hh2 = Math.floor(total / 60);
  const mm2 = total % 60;
  return `${String(hh2).padStart(2, '0')}:${String(mm2).padStart(2, '0')}`;
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h${m}`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function CompactTaskItem({ task, unscheduled, className, showDescription = false }: Props) {
  const hasTime = !unscheduled && task.scheduledTime;
  const durationMin = task.durationMin ?? 30;
  const start = hasTime ? task.scheduledTime! : null;
  const end = start ? addMinutes(start, durationMin) : null;
  return (
    <div
      className={cn(
        'rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 shadow-subtle text-xs flex flex-col gap-0.5',
        className
      )}
    >
      {hasTime ? (
        <div className="text-[10px] font-medium text-brand-600 flex items-center gap-1">
          <span>{start}</span>
          <span className="text-neutral-400">→</span>
          <span>{end}</span>
          <span className="text-neutral-400">({formatDuration(durationMin)})</span>
        </div>
      ) : (
        <div className="text-[10px] uppercase tracking-wide text-neutral-400">Sin hora</div>
      )}
      <div
        className={cn(
          'font-medium text-neutral-700 dark:text-neutral-200 leading-snug truncate',
          task.status === 'done' && 'line-through opacity-60'
        )}
        title={task.title}
      >
        {task.title}
      </div>
      {showDescription && task.description && (
        <div className="text-[10px] text-neutral-500 line-clamp-2 whitespace-pre-wrap break-words">
          {task.description}
        </div>
      )}
    </div>
  );
}
