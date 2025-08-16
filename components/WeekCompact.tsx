'use client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GUTTER_WIDTH } from '@/constants/layout';
import { useTasks } from '@/hooks/useTasks';
import { CompactTaskItem } from './CompactTaskItem';
import { useMemo } from 'react';
import { WeekDaysHeader } from './WeekDaysHeader';

interface Props {
  days: Date[];
}

/**
 * Vista compacta de sólo lectura del calendario semanal.
 * - No muestra grilla de horas.
 * - Lista las tareas de cada día secuencialmente (con hora primero, luego sin hora).
 * - Sin drag & drop ni resize (se pasa disableDrag y no se montan handlers).
 * - Cada tarea ocupa la misma altura (forceSingleSlot).
 */
export function WeekCompact({ days }: Props) {
  const { tasks } = useTasks();

  const byDay = useMemo(() => {
    return days.map((d) => {
      const iso = format(d, 'yyyy-MM-dd');
      const dayTasks = tasks.filter((t) => t.scheduledDate === iso);
      const withTime = dayTasks
        .filter((t) => t.scheduledTime)
        .sort((a, b) => (a.scheduledTime! < b.scheduledTime! ? -1 : a.scheduledTime! > b.scheduledTime! ? 1 : 0));
      const withoutTime = dayTasks.filter((t) => !t.scheduledTime);
      return { iso, date: d, withTime, withoutTime };
    });
  }, [days, tasks]);

  return (
    <div className="flex flex-col h-full">
      <WeekDaysHeader days={days} includeGutter gutterWidth={GUTTER_WIDTH} className="sticky top-0 z-30 px-4" />
      <div className="flex-1 min-w-0 overflow-auto py-4 px-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
          <div aria-hidden="true" />
          {byDay.map(({ iso, withTime, withoutTime }) => (
            <div key={iso} className="flex flex-col min-w-0">
              <div className="space-y-1">
                {withTime.map((t) => (
                  <CompactTaskItem key={t.id} task={t} />
                ))}
                {withoutTime.map((t) => (
                  <CompactTaskItem key={t.id} task={t} unscheduled />
                ))}
                {withTime.length === 0 && withoutTime.length === 0 && (
                  <div className="text-[10px] text-neutral-400">Sin tareas</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
