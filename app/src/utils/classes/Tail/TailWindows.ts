import { exec } from "child_process";
import fs from 'fs/promises';
import Tail from "./Tail";

type Options = {maxBuffer: number, encoding:string}

export default class TailWindows extends Tail {
  private running = false;
  constructor(filepath:string, private options:Options={maxBuffer: 1024*1024*50, encoding:'utf8'}){
    super(filepath)
  }

  start(){
      if(this.running)
          throw Error('Tail was already tailing the file: ' + this.filepath);
      this.running=true;
      // let exec = require('child_process').exec;
      let tailCommand = exec('PowerShell -Command Get-Content ' + this.filepath + ' –Wait -Tail 1 -Encoding UTF8', this.options);
      // console.log('tailcommand', Object.keys(tailCommand));
      // fs.readFile(this.filepath).then(l=>console.log(l));
      tailCommand.stdout?.on('data', (data:string) => {
        console.log('DATA', data);
          let lines = data.split('\n');
          lines.forEach( line => {
              if(line.length == 0)
                  return;
              // console.log(line.trim());
              this.listeners.forEach(l=>l(line.trim()));
          } );
      });
  }

  stop(){
      //TODO
  }
}