A simple batch processing module for [Nest](https://github.com/nestjs/nest), inspired by [Spring Batch](https://github.com/spring-projects/spring-batch).

Example usage:

```javascript
// Import the Batch module into your module
@Module({
  imports: [
    BatchCoreModule.register({
      chunkSize: 2,
    }),
  ],
  providers: [],
})

```

```javascript
  // The Batch module exports JobLauncher and JobFactory providers
  constructor(
    private readonly jobLauncher: JobLauncher,
    private readonly jobFactory: JobFactory,
    private readonly githubApiService: GithubApiService,
    private readonly mongoRepository: MongoJobRepository,
  ) {}


  @Cron(CronExpression.EVERY_MINUTE)
  async runBatch() {
    // Create the batch job instance
    const job = this.jobFactory
      .jobBuilder('Github-api-bacth-job')
      .listeners([new GithubJobListener()])
      .repository(this.mongoRepository)
      .addStep({
        reader: new GithubApiReader(this.githubApiService),
        processor: new GithubApiProcessor(),
        writer: new GithubApiWriter(),
        listeners: [new GithubStepListener()],
        name: 'Github-repo-processing-step',
      })
      .build();

    // run batch job
    const jobExecution = await this.jobLauncher.run(job);
    this.logger.log(`Job Execution Id: ${jobExecution.getId()}`);
  }
```

For more detailed usage please refer to the sample code under "github-api" module
