import {Tail as LinuxTail, TailOptions} from 'tail';

type Callback = (line:string)=>void

export default class FileTail{
  private listeners:Callback[] = [];
  private tail:LinuxTail|undefined;
  constructor(private filepath:string, private options:TailOptions = {fromBeginning:false, encoding:'utf8', flushAtEOF:true}){
  }

  addListener(callback:Callback){
    this.listeners.push(callback);
    return this;
  }

  start(){
    if(!this.tail){
      this.tail = new LinuxTail(this.filepath, this.options)
      this.tail.on('line', line=> this.listeners.forEach(l=>l(line.trim())));
    }
    else
      this.tail.watch();
  }

  stop(){
    this.tail?.unwatch();
  }
}