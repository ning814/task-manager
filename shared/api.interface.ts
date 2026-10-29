export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
}

export interface TaskListResponse {
  items: Task[];
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  completed?: boolean;
  priority?: TaskPriority;
  title?: string;
}
