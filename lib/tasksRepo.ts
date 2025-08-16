import { v4 as uuid } from 'uuid';
import { Task, NewTaskInput } from '@/types/task';

const STORAGE_KEY = 'planubi.tasks.v1';

type Listener = (tasks: Task[]) => void;

class TasksRepo {
  private tasks: Task[] = [];
  private listeners = new Set<Listener>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
      try {
        this.channel = new BroadcastChannel('planubi_tasks');
      } catch {
        /* ignore */
      }
      this.channel?.addEventListener('message', (ev) => {
        if (ev.data?.type === 'sync') {
          this.load();
          this.emit();
        }
      });
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      this.channel?.postMessage({ type: 'sync' });
    } catch (e) {
      console.warn('Persistencia fallida', e);
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.tasks = JSON.parse(raw);
    } catch (e) {
      console.warn('Carga fallida', e);
    }
  }

  private emit() {
    const snapshot = [...this.tasks];
    this.listeners.forEach((l) => l(snapshot));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAll() {
    return [...this.tasks];
  }

  create(data: NewTaskInput) {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuid(),
      title: data.title,
      description: data.description?.trim() || undefined,
      status: 'pending',
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
      order: this.nextOrder(),
    };
    this.tasks.push(task);
    this.persist();
    this.emit();
    return task;
  }

  update(id: string, patch: Partial<Task>) {
    const t = this.tasks.find((t) => t.id === id);
    if (!t) return;
    Object.assign(t, patch, { updatedAt: new Date().toISOString() });
    this.persist();
    this.emit();
  }

  remove(id: string) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.tasks.splice(idx, 1);
      this.persist();
      this.emit();
    }
  }

  reorderBacklog(ids: string[]) {
    const map = new Map(ids.map((id, i) => [id, i] as const));
    this.tasks.forEach((t) => {
      if (!t.scheduledDate && map.has(t.id)) {
        t.order = map.get(t.id)!;
      }
    });
    this.persist();
    this.emit();
  }

  private nextOrder() {
    return this.tasks.filter((t) => !t.scheduledDate).length;
  }
}

export const tasksRepo = new TasksRepo();
