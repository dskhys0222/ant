import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export interface Task {
  _id: string;
  username: string;
  encryptedData: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface TaskDataWithId extends TaskData {
  _id: string;
}

export interface TaskApiResult<T = unknown> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
}
