import {Tail as LinuxTail, TailOptions} from 'tail';
import Tail from './Tail';

export default class TailLinux extends Tail{
  private tail: LinuxTail|undefined
  constructor(filepath:string, private options:TailOptions = {fromBeginning:false, encoding:'utf8', flushAtEOF:true}){
    super(filepath);
  }

  start(){
    if(!this.tail){
      this.tail = new LinuxTail(this.filepath, this.options)
      this.tail.on('line', line=> console.log(line));
    }
    else
      this.tail.watch();
  }

  stop(){
    this.tail?.unwatch();
  }
}