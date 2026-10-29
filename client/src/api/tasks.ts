import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  Task,
  TaskPriority,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@shared/api.interface';

export async function fetchTasks(priority?: TaskPriority): Promise<TaskListResponse> {
  try {
    const params: Record<string, string> = {};
    if (priority) params.priority = priority;
    const response = await axiosForBackend.get<TaskListResponse>('/api/tasks', { params });
    return response.data;
  } catch (error) {
    logger.error('获取任务列表失败', error);
    throw error;
  }
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend.post<Task>('/api/tasks', data);
    return response.data;
  } catch (error) {
    logger.error('创建任务失败', error);
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend.patch<Task>(`/api/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    logger.error('更新任务失败', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await axiosForBackend.delete(`/api/tasks/${id}`);
  } catch (error) {
    logger.error('删除任务失败', error);
    throw error;
  }
}
