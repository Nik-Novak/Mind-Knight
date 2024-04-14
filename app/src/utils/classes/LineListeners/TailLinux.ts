import {Tail as LinuxTail, TailOptions} from 'tail';
import LineListener from './LineListener';

export default class TailLinux extends LineListener{
  private tail: LinuxTail|undefined
  constructor(filepath:string, private options:TailOptions = {fromBeginning:false, encoding:'utf8', flushAtEOF:true}){
    super(filepath);
  }

  start(){
    if(!this.tail){
      this.tail = new LinuxTail(this.filepath, this.options)
      this.tail.on('line', line=> this.listeners.forEach(l=>l(line.trim())) );
    }
    else
      this.tail.watch();
  }

  stop(){
    this.tail?.unwatch();
  }
}