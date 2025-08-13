export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "done";
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  durationMin?: number; // duración en minutos (múltiplos de 30). Default: 30
  dueDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO
  updatedAt: string; // ISO
  order?: number;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMin?: number;
  dueDate?: string;
}
