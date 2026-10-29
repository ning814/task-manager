import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '@/api/tasks';
import type {
  Task,
  TaskPriority,
} from '@shared/api.interface';

type FilterValue = 'all' | TaskPriority;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const FILTER_LABELS: Record<FilterValue, string> = {
  all: '全部',
  high: '高',
  medium: '中',
  low: '低',
};

function getPriorityBadgeVariant(
  priority: TaskPriority,
): 'destructive' | 'secondary' | 'default' {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'default';
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadTasks = async (priorityFilter?: TaskPriority) => {
    setLoading(true);
    try {
      const data = await fetchTasks(
        priorityFilter === undefined ? undefined : priorityFilter,
      );
      const sorted = [...data.items].sort(
        (a: Task, b: Task) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setTasks(sorted);
    } catch (error) {
      logger.error('加载任务失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const priorityFilter = filter === 'all' ? undefined : filter;
    void loadTasks(priorityFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask({ title: title.trim(), priority: newPriority });
      setTitle('');
      setNewPriority('medium');
      const priorityFilter = filter === 'all' ? undefined : filter;
      await loadTasks(priorityFilter);
    } catch (error) {
      logger.error('创建任务失败', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      const priorityFilter = filter === 'all' ? undefined : filter;
      await loadTasks(priorityFilter);
    } catch (error) {
      logger.error('切换任务状态失败', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      const priorityFilter = filter === 'all' ? undefined : filter;
      await loadTasks(priorityFilter);
    } catch (error) {
      logger.error('删除任务失败', error);
    }
  };

  const filterOptions: FilterValue[] = ['all', 'high', 'medium', 'low'];

  return (
    <div className="min-h-screen bg-muted/40 py-10 px-4">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          智能任务管理
        </h1>

        <div className="bg-card text-card-foreground rounded-xl shadow-lg p-6 space-y-4">
          {/* 添加任务区 */}
          <form onSubmit={handleCreate} className="flex gap-3 items-center">
            <Input
              type="text"
              placeholder="请输入任务标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Select
              value={newPriority}
              onValueChange={(val) => setNewPriority(val as TaskPriority)}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={submitting || !title.trim()}>
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </form>

          {/* 筛选区 */}
          <div className="flex gap-1 border-b border-border pb-4">
            {filterOptions.map((opt: FilterValue) => (
              <Button
                key={opt}
                variant={filter === opt ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(opt)}
                className="px-3"
              >
                {FILTER_LABELS[opt]}
              </Button>
            ))}
          </div>

          {/* 任务列表 */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              加载中...
            </div>
          ) : tasks.length === 0 ? (
            <Empty className="border-0 py-8">
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <ClipboardList className="size-6" />
                </EmptyMedia>
                <EmptyTitle>暂无任务</EmptyTitle>
                <EmptyDescription>
                  快创建一个新任务开始使用吧
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task: Task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                    aria-label={`标记任务${task.title}为${task.completed ? '未完成' : '已完成'}`}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      task.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </span>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleComplete(task)}
                    aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                    aria-label="删除任务"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
