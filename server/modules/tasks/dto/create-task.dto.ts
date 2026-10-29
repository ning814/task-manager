import { IsIn, IsString, Length } from 'class-validator';
import type { CreateTaskRequest } from '@shared/api.interface';

export class CreateTaskDto implements CreateTaskRequest {
  @IsString()
  @Length(1, 255)
  title!: string;

  @IsString()
  @IsIn(['high', 'medium', 'low'])
  priority!: 'high' | 'medium' | 'low';
}
