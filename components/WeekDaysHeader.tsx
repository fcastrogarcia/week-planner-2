'use client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GUTTER_WIDTH } from '@/constants/layout';
import React from 'react';

interface Props {
  days: Date[];
  /** Muestra una celda vacía a la izquierda para alinear con la columna de horas (80px). */
  includeGutter?: boolean;
  /** Ancho del gutter izquierdo. */
  gutterWidth?: number;
  className?: string;
  /** Si se desea hacer sticky se puede pasar clases externas (p.ej. sticky top-0). */
}

export function WeekDaysHeader({ days, includeGutter = true, gutterWidth = GUTTER_WIDTH, className = '' }: Props) {
  return (
    <div
      className={'grid bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 ' + className}
      style={{ gridTemplateColumns: `${includeGutter ? gutterWidth + 'px ' : ''}repeat(${days.length}, 1fr)` }}
    >
      {includeGutter && <div className="border-neutral-200 dark:border-neutral-800" aria-hidden="true" />}
      {days.map((d) => (
        <div key={d.toISOString()} className="p-2">
          <div className="text-xs font-medium text-neutral-500">{format(d, 'EEE d', { locale: es })}</div>
        </div>
      ))}
    </div>
  );
}
