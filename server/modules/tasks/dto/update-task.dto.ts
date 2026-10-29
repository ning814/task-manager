import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';
import type { UpdateTaskRequest } from '@shared/api.interface';

export class UpdateTaskDto implements UpdateTaskRequest {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;
}
