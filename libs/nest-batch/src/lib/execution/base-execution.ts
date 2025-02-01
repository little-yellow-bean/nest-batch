import { v4 as uuid } from 'uuid';

export enum ExecutionStatus {
  CREATED = 'CREATED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

const VALID_TRANSITIONS: Record<
  ExecutionStatus,
  ExecutionStatus[] | undefined
> = {
  [ExecutionStatus.CREATED]: [
    ExecutionStatus.STARTING,
    ExecutionStatus.ABANDONED,
  ],
  [ExecutionStatus.STARTING]: [ExecutionStatus.STARTED, ExecutionStatus.FAILED],
  [ExecutionStatus.STARTED]: [
    ExecutionStatus.PAUSED,
    ExecutionStatus.STOPPING,
    ExecutionStatus.COMPLETED,
    ExecutionStatus.FAILED,
  ],
  [ExecutionStatus.STOPPING]: [ExecutionStatus.STOPPED, ExecutionStatus.FAILED],
  [ExecutionStatus.PAUSED]: [ExecutionStatus.STARTING],
  [ExecutionStatus.STOPPED]: [],
  [ExecutionStatus.FAILED]: [],
  [ExecutionStatus.COMPLETED]: [],
  [ExecutionStatus.ABANDONED]: [],
};

export interface ExecutionOptions {
  id?: string;
  name?: string;
  status?: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  createdTime?: Date;
  lastUpdatedTime?: Date;
  exitStatus?: string;
  failureExceptions?: string[];
}

export abstract class BaseExecution {
  id: string;
  name: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  createTime: Date;
  lastUpdatedTime: Date;
  exitStatus: string;
  failureExceptions: string[] = [];

  constructor(options: ExecutionOptions = {}) {
    this.id = options.id || uuid();
    this.name = options.name || '';
    this.status = options.status || ExecutionStatus.CREATED;
    this.startTime = options.startTime;
    this.endTime = options.endTime;
    this.createTime = options.createdTime || new Date();
    this.lastUpdatedTime = options.lastUpdatedTime || new Date();
    this.exitStatus = options.exitStatus || '';
    this.failureExceptions = options.failureExceptions || [];
  }

  setId(id: string) {
    this.id = id;
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setCreateTime(createTime: Date) {
    this.createTime = createTime;
    return this;
  }

  setLastUpdatedTime(lastUpdatedTime: Date) {
    this.lastUpdatedTime = lastUpdatedTime;
    return this;
  }

  transitionStatus(status: ExecutionStatus) {
    if (!this.isValidTransition(status)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${status}`
      );
    }
    this.status = status;
    return this;
  }

  setStatus(status: ExecutionStatus) {
    this.status = status;
    return this;
  }

  setStartTime(startTime?: Date) {
    this.startTime = startTime;
    return this;
  }

  setEndTime(endTime?: Date) {
    this.endTime = endTime;
    return this;
  }

  setExitStatus(exitStatus: string) {
    this.exitStatus = exitStatus;
    return this;
  }

  addFailureException(error: string) {
    this.failureExceptions.push(error);
    return this;
  }

  setFailureExceptions(errors: string[]) {
    this.failureExceptions = [...errors];
    return this;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): ExecutionStatus {
    return this.status;
  }

  getStartTime(): Date | undefined {
    return this.startTime;
  }

  getEndTime(): Date | undefined {
    return this.endTime;
  }

  getCreateTime(): Date {
    return this.createTime;
  }

  getExitStatus(): string {
    return this.exitStatus;
  }

  getFailureExceptions(): string[] {
    return [...this.failureExceptions];
  }

  getLastUpdatedTime(): Date {
    return this.lastUpdatedTime;
  }

  isRunning(): boolean {
    return (
      this.status === ExecutionStatus.STARTING ||
      this.status === ExecutionStatus.STARTED
    );
  }

  isStopping(): boolean {
    return this.status === ExecutionStatus.STOPPING;
  }

  isStopped(): boolean {
    return this.status === ExecutionStatus.STOPPED;
  }

  isComplete(): boolean {
    return this.status === ExecutionStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === ExecutionStatus.FAILED;
  }

  isAbandoned(): boolean {
    return this.status === ExecutionStatus.ABANDONED;
  }

  protected from(execution: BaseExecution) {
    this.setId(execution.getId());
    this.setName(execution.getName());
    this.setCreateTime(execution.getCreateTime());
    this.setLastUpdatedTime(execution.getLastUpdatedTime());
    this.setStatus(execution.getStatus());
    this.setStartTime(execution.getStartTime());
    this.setEndTime(execution.getEndTime());
    this.setExitStatus(execution.getExitStatus());
    this.setFailureExceptions(execution.getFailureExceptions());
    return this;
  }

  private isValidTransition(newStatus: ExecutionStatus): boolean {
    const allowedTransitions = VALID_TRANSITIONS[this.status] || [];

    return allowedTransitions.includes(newStatus);
  }
}
