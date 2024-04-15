import LineListener from "./LineListener";
import readline from 'readline';
import fs from 'fs';
import { sleep } from "@/utils/functions/general";

export type ReadLineOptions = {
  timeBetweenLinesMS: number,
  startAtLineContaining?:string,
  onComplete?:(num_lines_read:number)=>void
}

export class ReadLine extends LineListener{
  private options:ReadLineOptions;
  private rl:readline.Interface;
  public lines_read = 0;
  constructor(filepath:string, options:Partial<ReadLineOptions>={}){
    super(filepath);
    this.options = { timeBetweenLinesMS:1000, ...options };
    this.rl = readline.createInterface({
      input: fs.createReadStream(this.filepath),
      crlfDelay: Infinity,
    });
    this.rl.pause();
    this.doRead();
  }

  private async doRead(){
    let foundStartingPoint = !this.options.startAtLineContaining;
    for await (const line of this.rl) {
      // console.log(line);
      if(line.includes(this.options.startAtLineContaining!))
        foundStartingPoint = true;
      if(foundStartingPoint){
        this.listeners.forEach(l => l(line));
        ++this.lines_read;
        await sleep(this.options.timeBetweenLinesMS);
      }
    }
    // console.log('DONE');
    if(this.options.onComplete)
      this.options.onComplete(this.lines_read);
  }

  async start() {
    this.rl.resume();
  }
  
  stop(): void {
    this.rl.pause();
  }

  close(){
    this.rl.close();
  }
}