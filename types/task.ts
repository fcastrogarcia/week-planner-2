export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "done";
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
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
  dueDate?: string;
}
