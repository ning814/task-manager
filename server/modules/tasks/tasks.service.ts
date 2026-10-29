import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task, TaskPriority } from '@shared/api.interface';
import { SupabaseService } from './supabase.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';

const PRIORITY_MAP: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_REVERSE: Record<string, TaskPriority> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

interface SupabaseTask {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

@Injectable()
export class TasksService {
  constructor(private readonly supabase: SupabaseService) {}

  private mapRow(row: SupabaseTask): Task {
    return {
      id: String(row.id),
      title: row.title,
      priority: PRIORITY_REVERSE[row.priority] ?? 'medium',
      completed: row.completed,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  async findAll(priority?: TaskPriority): Promise<{ items: Task[] }> {
    const client = this.supabase.getClient();
    let query = client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (priority) {
      query = query.eq('priority', PRIORITY_MAP[priority]);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as SupabaseTask[]) || [];
    return {
      items: rows.map((row: SupabaseTask) => this.mapRow(row)),
    };
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('tasks')
      .insert({
        title: dto.title,
        priority: PRIORITY_MAP[dto.priority],
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data as SupabaseTask);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const client = this.supabase.getClient();
    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) patch.priority = PRIORITY_MAP[dto.priority];
    if (dto.completed !== undefined) patch.completed = dto.completed;

    const { data, error } = await client
      .from('tasks')
      .update(patch)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('任务不存在');
      }
      throw error;
    }

    return this.mapRow(data as SupabaseTask);
  }

  async remove(id: string): Promise<{ success: true }> {
    const client = this.supabase.getClient();
    const { error, status } = await client
      .from('tasks')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;
    if (status === 406) throw new NotFoundException('任务不存在');

    return { success: true };
  }
}
