type JobFunc = ()=>void|Promise<void>;
type Job = { jobName?:string, job:JobFunc };
export interface ProcessQueueOptions {
  /**
   * Max number of jobs the queue should process concurrently.
   * @default Infinity
   */
  // concurrency?: number;

  /**
   * Milliseconds to wait for a job to execute its callback.
   * @default 0
   */
  // timeout?: number;

  /**
   * Ensures the queue is always running if jobs are available. Useful in situations where you are using a queue only for concurrency control.
   * @default false
   */
  autostart?: boolean;
}
export default class ProcessQueue {
  private jobQueue:Job[] = [];
  private options:ProcessQueueOptions;
  constructor(options?:ProcessQueueOptions){
    this.options = { autostart:false, ...options}
  }
  push(job:Job|JobFunc, jobName?:string){
    if(typeof job === 'function'){
      this.jobQueue.push({job, jobName});
      console.log('QUEUED', jobName);
    }
    else {
      this.jobQueue.push(job);
      console.log('QUEUED', job.jobName);
    }
    if(this.options.autostart)
      this.process();
  }

  private processing=false;
  private async process(){
    if(!this.processing){
      this.processing=true;
      while(this.jobQueue.length){
        let job = this.jobQueue.shift();
        if(job){
          console.log('START JOB', job.jobName)
          await job.job()
          console.log('END JOB', job.jobName)
        }
      }
      this.processing = false;
    }
  }

  start(){
    this.process();
  }

  get numJobs(){
    return this.jobQueue.length;
  }
}