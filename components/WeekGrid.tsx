"use client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TaskCard } from "./TaskCard";
import { TaskInlineCreator } from "./TaskInlineCreator";
import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { useDnd } from "@/context/dnd";
import { useTaskResize } from "@/hooks/useTaskResize";
import { useTasks } from "@/hooks/useTasks";

interface Props {
  days: Date[];
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 - 23:00

export function WeekGrid({ days }: Props) {
  const { tasks, updateTask } = useTasks();
  const { dragging, endDrag } = useDnd();
  const [inlineCreator, setInlineCreator] = useState<{ day: string; time?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasBottomOverflow, setHasBottomOverflow] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [badgeRect, setBadgeRect] = useState<{ left: number; width: number; bottom: number }>({
    left: 0,
    width: 0,
    bottom: 0,
  });
  const { resizing, onResizeMouseDown, computeRowPlacement } = useTaskResize({
    tasks,
    updateTask,
    hoursStart: HOURS[0],
    hoursLength: HOURS.length,
  });

  function openCreator(dayISO: string, hour?: number, minute: number = 0) {
    let time: string | undefined = undefined;
    if (hour !== undefined) {
      const hourStr = String(hour).padStart(2, "0");
      const minuteStr = String(minute).padStart(2, "0");
      time = `${hourStr}:${minuteStr}`;
    }
    setInlineCreator({ day: dayISO, time });
  }

  const recomputeOverflowWindow = useCallback(() => {
    const nodes = document.querySelectorAll(
      "[data-slot-has-tasks], [data-unscheduled-has-tasks], [data-task-overlay]"
    );
    const doc = document.documentElement;
    const viewportBottom = doc.clientHeight + window.scrollY;
    let maxBottom = 0;
    nodes.forEach((n) => {
      const rect = (n as HTMLElement).getBoundingClientRect();
      const bottomAbs = rect.bottom + window.scrollY;
      if (bottomAbs > maxBottom) maxBottom = bottomAbs;
    });
    const anyBelow = maxBottom > viewportBottom + 1; // 1px de tolerancia
    setHasBottomOverflow(anyBelow);
  }, []);

  const computeBadgeRect = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const bottom = Math.max(window.innerHeight - rect.bottom, 0);
    setBadgeRect({ left: Math.max(rect.left, 0), width: Math.max(rect.width, 0), bottom });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      recomputeOverflowWindow();
    };
    const onWindowScroll = () => {
      recomputeOverflowWindow();
      computeBadgeRect();
    };
    const onResize = () => {
      recomputeOverflowWindow();
      computeBadgeRect();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    requestAnimationFrame(() => {
      recomputeOverflowWindow();
      computeBadgeRect();
    });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [recomputeOverflowWindow, computeBadgeRect]);

  useEffect(() => {
    requestAnimationFrame(() => recomputeOverflowWindow());
  }, [tasks, inlineCreator, recomputeOverflowWindow, resizing]);

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado de días */}
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            <div className="text-xs font-medium text-neutral-500">
              {format(d, "EEE d", { locale: es })}
            </div>
          </div>
        ))}
      </div>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto relative">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
            gridTemplateRows: `auto repeat(${HOURS.length * 2}, 40px)`,
          }}
        >
          {/* Columna de horas */}
          <div
            className="border-b border-neutral-100 dark:border-neutral-800"
            style={{ gridColumn: 1, gridRow: 1 }}
          />
          {HOURS.map((h, i) => (
            <div
              key={h}
              style={{ gridColumn: 1, gridRow: `${2 + i * 2} / span 2` }}
              className="border-b border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-start justify-end pr-1 pt-1 select-none"
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}

          {/* Columnas por día */}
          {days.map((day, dayIdx) => {
            const iso = format(day, "yyyy-MM-dd");
            const dayTasks = tasks.filter((t) => t.scheduledDate === iso);
            const timed = dayTasks.filter((t) => t.scheduledTime);
            const unscheduled = dayTasks.filter((t) => !t.scheduledTime);

            return (
              <Fragment key={iso}>
                {/* Overlay de bordes verticales de la columna */}
                <div
                  style={{ gridColumn: dayIdx + 2, gridRow: "1 / -1" }}
                  className={
                    "pointer-events-none border-l border-neutral-100 dark:border-neutral-800 " +
                    (dayIdx === days.length - 1
                      ? "border-r border-neutral-100 dark:border-neutral-800"
                      : "")
                  }
                />

                {/* Sin hora: fila 1 */}
                <div
                  style={{ gridColumn: dayIdx + 2, gridRow: 1 }}
                  className={`bg-neutral-50/60 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 transition-colors rounded-b-sm min-w-0 ${
                    hoveredSlot === `${iso}-unscheduled`
                      ? "outline outline-1 outline-brand-400/70 bg-brand-50/60 dark:bg-brand-400/10 z-10"
                      : ""
                  }`}
                  onDragEnter={() => {
                    if (dragging?.type === "task") setHoveredSlot(`${iso}-unscheduled`);
                  }}
                  onDragOver={(e) => {
                    if (dragging?.type === "task") e.preventDefault();
                  }}
                  onDragLeave={(e) => {
                    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
                    if (hoveredSlot === `${iso}-unscheduled`) setHoveredSlot(null);
                  }}
                  onDrop={(e) => {
                    if (dragging?.type === "task") {
                      e.preventDefault();
                      updateTask(dragging.taskId, { scheduledDate: iso, scheduledTime: undefined });
                      endDrag();
                      setHoveredSlot(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1 px-1 pt-2">
                    <span className="text-[10px] uppercase tracking-wide text-neutral-400 font-medium">
                      Sin hora
                    </span>
                    {inlineCreator && inlineCreator.day === iso && !inlineCreator.time ? null : (
                      <button
                        onClick={() => openCreator(iso)}
                        className="text-[10px] text-brand-600 hover:underline"
                      >
                        + Añadir
                      </button>
                    )}
                  </div>
                  <div
                    data-unscheduled-inner
                    data-unscheduled-has-tasks={
                      unscheduled.length > 0 ||
                      (inlineCreator && inlineCreator.day === iso && !inlineCreator.time)
                        ? ""
                        : undefined
                    }
                    className="space-y-1 min-h-[40px] min-w-0 px-1 pb-1"
                  >
                    {unscheduled.map((t) => (
                      <TaskCard key={t.id} task={t} variant="backlog" />
                    ))}
                    {inlineCreator && inlineCreator.day === iso && !inlineCreator.time && (
                      <TaskInlineCreator
                        scheduledDate={iso}
                        autoFocus
                        onCreated={() => setInlineCreator(null)}
                      />
                    )}
                  </div>
                </div>

                {/* Slots horarios (dropzones y sumar) */}
                {HOURS.map((h, i) => {
                  const hourStr = String(h).padStart(2, "0");
                  const subSlots: Array<"00" | "30"> = ["00", "30"];
                  return subSlots.map((mm, idx) => {
                    const timeStr = `${hourStr}:${mm}`;
                    const row = 2 + i * 2 + idx;
                    const isCreator =
                      inlineCreator && inlineCreator.day === iso && inlineCreator.time === timeStr;

                    return (
                      <div
                        key={`${iso}-${h}-${mm}`}
                        style={{ gridColumn: dayIdx + 2, gridRow: row }}
                        className={`h-10 relative group/half px-1 py-1 min-w-0 ${
                          idx === 1 ? "border-b border-neutral-100 dark:border-neutral-800" : ""
                        } ${
                          hoveredSlot === `${iso}-${timeStr}`
                            ? "outline outline-1 outline-brand-400/70 bg-brand-50/50 dark:bg-brand-400/10 z-10"
                            : ""
                        }`}
                        data-slot-has-tasks={isCreator ? "" : undefined}
                        onDragEnter={() => {
                          if (dragging?.type === "task") setHoveredSlot(`${iso}-${timeStr}`);
                        }}
                        onDragOver={(e) => {
                          if (dragging?.type === "task") e.preventDefault();
                        }}
                        onDragLeave={(e) => {
                          if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
                            return;
                          if (hoveredSlot === `${iso}-${timeStr}`) setHoveredSlot(null);
                        }}
                        onDrop={(e) => {
                          if (dragging?.type === "task") {
                            e.preventDefault();
                            updateTask(dragging.taskId, {
                              scheduledDate: iso,
                              scheduledTime: timeStr,
                            });
                            endDrag();
                            setHoveredSlot(null);
                          }
                        }}
                      >
                        <div className="absolute inset-0 group-hover/half:bg-brand-50/30 dark:group-hover/half:bg-neutral-800/30 pointer-events-none transition" />
                        <div className="space-y-1 min-w-0">
                          {isCreator ? (
                            <TaskInlineCreator
                              scheduledDate={iso}
                              scheduledTime={timeStr}
                              autoFocus
                              onCreated={() => setInlineCreator(null)}
                            />
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => openCreator(iso, h, idx === 0 ? 0 : 30)}
                                className="opacity-0 group-hover/half:opacity-100 text-[10px] text-brand-600 hover:underline"
                              >
                                + Añadir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })}

                {/* Overlays de tareas programadas que spanean filas */}
                {timed.map((t) => {
                  const { rowStart, rowSpan } = computeRowPlacement(t);
                  return (
                    <div
                      key={`ovl-${t.id}`}
                      style={{ gridColumn: dayIdx + 2, gridRow: `${rowStart} / span ${rowSpan}` }}
                      data-task-overlay=""
                      className="px-1 py-0.5 z-10 min-w-0 relative"
                    >
                      <TaskCard
                        task={t}
                        variant="scheduled"
                        className="h-full"
                        disableDrag={resizing?.taskId === t.id}
                      />
                      {/* Handle de resize inferior */}
                      <div
                        onMouseDown={(e) => onResizeMouseDown(e, t.id, t.scheduledTime as string)}
                        className="absolute left-1 right-1 bottom-1 h-2 cursor-ns-resize rounded-sm bg-neutral-300/50 dark:bg-neutral-600/50 opacity-0 hover:opacity-100"
                        title="Arrastrar para cambiar duración"
                      />
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>

        {hasBottomOverflow && (
          <div
            className="pointer-events-none fixed h-12 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent flex items-end justify-center pb-3 z-50"
            style={{ left: badgeRect.left, width: badgeRect.width, bottom: badgeRect.bottom }}
          >
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
              Más tareas abajo
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
