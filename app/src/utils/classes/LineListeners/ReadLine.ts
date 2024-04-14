import LineListener from "./LineListener";
import readline from 'readline';
import fs from 'fs';
import { sleep } from "@/utils/functions/general";

export type ReadLineOptions = {
  timeBetweenLinesMS: number
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
    this.startRead();
  }

  private async startRead(){
    for await (const line of this.rl) {
      this.listeners.forEach(l => l(line));
      await sleep(this.options.timeBetweenLinesMS);
    }
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