'use client';
import { useState, useRef, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface Props {
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  placeholder?: string;
  autoFocus?: boolean;
  onCreated?: () => void;
  className?: string;
}

export function TaskInlineCreator({
  scheduledDate,
  scheduledTime,
  placeholder = 'Nueva tarea…',
  autoFocus,
  onCreated,
  className,
}: Props) {
  const { createTask } = useTasks();
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.trim();
    if (!title) return;
    createTask({ title, scheduledDate, scheduledTime });
    setValue('');
    onCreated?.();
  }

  function handleBlur() {
    if (value.trim() === '') {
      onCreated?.();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setValue('');
      onCreated?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2 group', className)}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
      />
    </form>
  );
}
