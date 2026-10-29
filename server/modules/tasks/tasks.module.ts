import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService, SupabaseService],
})
export class TasksModule {}
