import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ExecutionStatus } from 'nest-batch';

class BaseExecutionModel {
  @Prop()
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, required: true, enum: ExecutionStatus })
  status: ExecutionStatus;

  @Prop()
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop()
  createAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ default: '' })
  exitStatus: string;

  @Prop({ type: [String], default: [] })
  failureExceptions: string[];
}

@Schema({ timestamps: true, collection: 'job_executions' })
export class JobExecutionModel extends BaseExecutionModel {
  @Prop({ type: Object, default: {} })
  jobParameters: Record<string, any>;
}

@Schema({ timestamps: true, collection: 'step_executions' })
export class StepExecutionModel extends BaseExecutionModel {
  @Prop({ type: Types.ObjectId, ref: JobExecutionModel.name, required: true })
  jobExecution: JobExecutionModel;

  @Prop({ default: 0 })
  readCount: number;

  @Prop({ default: 0 })
  writeCount: number;

  @Prop({ default: 0 })
  commitCount: number;

  @Prop({ default: 0 })
  rollbackCount: number;

  @Prop({ default: 0 })
  readSkipCount: number;

  @Prop({ default: 0 })
  processSkipCount: number;

  @Prop({ default: 0 })
  writeSkipCount: number;
}

export const JobExecutionSchema =
  SchemaFactory.createForClass(JobExecutionModel);
export const StepExecutionSchema =
  SchemaFactory.createForClass(StepExecutionModel);
