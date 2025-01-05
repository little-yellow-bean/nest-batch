import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  JobExecution,
  StepExecution,
  ExecutionFilter,
  JobRepository,
} from 'nest-batch';
import {
  JobExecutionModel,
  StepExecutionModel,
} from '../../models/mongo.schema';

@Injectable()
export class MongoJobRepository implements JobRepository {
  constructor(
    @InjectModel(JobExecutionModel.name)
    private jobExecutionModel: Model<JobExecutionModel>,
    @InjectModel(StepExecutionModel.name)
    private stepExecutionModel: Model<StepExecutionModel>
  ) {}
  async saveJobExecution(execution: JobExecution): Promise<JobExecution> {
    const result = await this.jobExecutionModel.create({
      _id: execution.getId(),
      name: execution.getName(),
      status: execution.getStatus(),
      jobParameters: execution.getJobParameters(),
      startTime: execution.getStartTime(),
      endTime: execution.getEndTime(),
    });

    return this.buildJobExecutionFromModel(result);
  }
  async saveStepExecution(execution: StepExecution): Promise<StepExecution> {
    const jobExecutionData = await this.jobExecutionModel.findById(
      execution.getJobExecution().getId()
    );
    await this.stepExecutionModel.create({
      _id: execution.getId(),
      name: execution.getName(),
      status: execution.getStatus(),
      jobExecution: jobExecutionData,
      startTime: execution.getStartTime(),
      endTime: execution.getEndTime(),
    });
    const newItem = await this.findStepExecutionById(execution.getId());
    return newItem;
  }
  async updateJobExecution(execution: JobExecution): Promise<JobExecution> {
    const updated = await this.jobExecutionModel.findOneAndUpdate(
      {
        _id: execution.getId(),
      },
      {
        status: execution.getStatus(),
        startTime: execution.getStartTime(),
        endTime: execution.getEndTime(),
        exitStatus: execution.getExitStatus(),
        failureExceptions: execution.getFailureExceptions(),
      },
      { new: true }
    );
    return this.buildJobExecutionFromModel(updated);
  }
  async updateStepExecution(execution: StepExecution): Promise<StepExecution> {
    const updated = await this.stepExecutionModel.findOneAndUpdate(
      {
        _id: execution.getId(),
      },
      {
        status: execution.getStatus(),
        startTime: execution.getStartTime(),
        endTime: execution.getEndTime(),
        exitStatus: execution.getExitStatus(),
        failureExceptions: execution.getFailureExceptions(),
      },
      { populate: 'jobExecution', new: true }
    );
    return this.buildStepExecutionFromModel(updated);
  }

  async findJobExecutionById(id: string): Promise<JobExecution | null> {
    const result = await this.jobExecutionModel.findById(id);
    return this.buildJobExecutionFromModel(result);
  }
  async findStepExecutionById(id: string): Promise<StepExecution | null> {
    const result = await this.stepExecutionModel.findById(
      id,
      {},
      { populate: 'jobExecution' }
    );
    return this.buildStepExecutionFromModel(result);
  }
  async findJobExecutionBy({
    name,
    statuses,
    id,
  }: ExecutionFilter): Promise<JobExecution[]> {
    let query: Record<string, any> = {};

    if (id) {
      query = { _id: id };
    }
    if (name) {
      query = { ...query, name };
    }

    if (statuses?.length) {
      query = { statuses: { $in: statuses } };
    }

    const result = await this.jobExecutionModel.find(query);

    return result.map((model) => this.buildJobExecutionFromModel(model));
  }

  async findStepExecutionBy({
    name,
    statuses,
    id,
  }: ExecutionFilter): Promise<StepExecution[]> {
    let query: Record<string, any> = {};

    if (id) {
      query = { _id: id };
    }
    if (name) {
      query = { ...query, name };
    }

    if (statuses?.length) {
      query = { statuses: { $in: statuses } };
    }

    const result = await this.stepExecutionModel.find(
      query,
      {},
      { populate: 'jobExecution' }
    );

    return result.map((model) => this.buildStepExecutionFromModel(model));
  }

  private buildJobExecutionFromModel(model: JobExecutionModel) {
    const jobExecution = new JobExecution()
      .setCreateTime(model.createAt)
      .setEndTime(model.endTime)
      .setExitStatus(model.exitStatus)
      .setFailureExceptions(model.failureExceptions)
      .setId(model._id)
      .setJobParameters(model.jobParameters)
      .setLastUpdatedTime(model.updatedAt)
      .setName(model.name)
      .setStartTime(model.startTime)
      .setStatus(model.status);
    return jobExecution;
  }
  private buildStepExecutionFromModel(model: StepExecutionModel) {
    const jobExecution = this.buildJobExecutionFromModel(model.jobExecution);
    const stepExecution = new StepExecution()
      .setStatus(model.status)
      .setCreateTime(model.createAt)
      .setEndTime(model.endTime)
      .setExitStatus(model.exitStatus)
      .setFailureExceptions(model.failureExceptions)
      .setId(model._id)
      .setJobExecution(jobExecution)
      .setLastUpdatedTime(model.updatedAt)
      .setName(model.name)
      .setStartTime(model.startTime);
    return stepExecution;
  }
}
