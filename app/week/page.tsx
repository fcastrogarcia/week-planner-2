'use client';
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { parseISO, startOfWeek, isValid, addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BacklogPanel } from '@/components/BacklogPanel';
import { WeekGrid } from '@/components/WeekGrid';
import { useMemo } from 'react';

function parseWeekStart(start?: string | null) {
  if (!start) return startOfWeek(new Date(), { weekStartsOn: 1 });
  const d = parseISO(start);
  if (!isValid(d)) return startOfWeek(new Date(), { weekStartsOn: 1 });
  return startOfWeek(d, { weekStartsOn: 1 });
}

function WeekPageInner() {
  const params = useSearchParams();
  const weekStart = parseWeekStart(params.get('start'));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  useEffect(() => {
    document.body.setAttribute('data-week-start', format(weekStart, 'yyyy-MM-dd'));
    return () => {
      document.body.removeAttribute('data-week-start');
    };
  }, [weekStart]);

  function shiftWeek(delta: number) {
    const target = addDays(weekStart, delta * 7);
    const qs = new URLSearchParams(window.location.search);
    qs.set('start', format(target, 'yyyy-MM-dd'));
    window.history.pushState(null, '', `/week?${qs.toString()}`);
    // Forzar refresh suave (Next no recarga automáticamente al manipular history manual)
    window.dispatchEvent(new Event('popstate'));
  }

  return (
    <div className="flex flex-1 min-h-0 w-full">
      <BacklogPanel className="w-80 border-r border-neutral-200 dark:border-neutral-800" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftWeek(-1)}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 h-7 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ◀
            </button>
            <button
              onClick={() => shiftWeek(1)}
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 h-7 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ▶
            </button>
          </div>
          <h2 className="font-medium text-sm text-neutral-600 dark:text-neutral-300">
            Semana de {format(weekStart, "d 'de' MMMM", { locale: es })}
          </h2>
        </div>
        <WeekGrid days={days} />
      </div>
    </div>
  );
}

export default function WeekPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-neutral-500">Cargando semana…</div>}>
      <WeekPageInner />
    </Suspense>
  );
}
