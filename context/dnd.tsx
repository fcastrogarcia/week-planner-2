'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface DragDataTaskSlot {
  type: 'task';
  taskId: string;
  from?: { date: string | null; time: string | null };
}

interface DndContextValue {
  dragging: DragDataTaskSlot | null;
  startDrag: (data: DragDataTaskSlot) => void;
  endDrag: () => void;
}

const Ctx = createContext<DndContextValue | null>(null);

export function DndProvider({ children }: { children: ReactNode }) {
  const [dragging, setDragging] = useState<DragDataTaskSlot | null>(null);
  return (
    <Ctx.Provider value={{ dragging, startDrag: setDragging, endDrag: () => setDragging(null) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDnd() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDnd fuera de DndProvider');
  return v;
}
