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

const VALID_TRANSITIONS: Record<ExecutionStatus, ExecutionStatus[]> = {
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

export abstract class BaseExecution {
  protected id: string;
  protected name: string;
  protected status: ExecutionStatus;
  protected startTime: Date;
  protected endTime: Date;
  protected createTime: Date;
  protected lastUpdatedTime: Date;
  protected exitStatus: string;
  protected failureExceptions: string[] = [];

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

  setStatus(status: ExecutionStatus) {
    if (!this.isValidTransition(status)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${status}`,
      );
    }
    this.status = status;
    return this;
  }

  setStartTime(startTime: Date) {
    this.startTime = startTime;
    return this;
  }

  setEndTime(endTime: Date) {
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

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date {
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
    this.status = execution.status;
    this.setStartTime(execution.getStartTime());
    this.setEndTime(execution.getEndTime());
    this.setExitStatus(execution.getExitStatus());
    this.setFailureExceptions(execution.getFailureExceptions());
  }

  private isValidTransition(newStatus: ExecutionStatus): boolean {
    const allowedTransitions = VALID_TRANSITIONS[this.status] || [
      ExecutionStatus.CREATED,
    ];

    return allowedTransitions.includes(newStatus);
  }
}
