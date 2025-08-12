"use client";
import { useEffect, useState, useCallback } from "react";
import { tasksRepo } from "@/lib/tasksRepo";
import { NewTaskInput, Task } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => tasksRepo.getAll());

  useEffect(() => {
    const unsub = tasksRepo.subscribe(setTasks);
    return () => unsub();
  }, []);

  const createTask = useCallback((data: NewTaskInput) => tasksRepo.create(data), []);
  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => tasksRepo.update(id, patch),
    []
  );
  const deleteTask = useCallback((id: string) => tasksRepo.remove(id), []);

  return { tasks, createTask, updateTask, deleteTask };
}
