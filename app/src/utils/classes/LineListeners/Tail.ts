import {Tail as NPMTail, TailOptions} from 'tail';
import LineListener from './LineListener';

export default class Tail extends LineListener{
  private tail: NPMTail|undefined
  private options:TailOptions;
  constructor(filepath:string, options:Partial<TailOptions> = {}){
    super(filepath);
    this.options = {fromBeginning:false, encoding:'utf8', flushAtEOF:true, follow:true, ...options};
  }

  start(){
    if(!this.tail){
      this.tail = new NPMTail(this.filepath, this.options)
      this.tail.on('line', line=> this.listeners.forEach(l=>l(line.trim())) );
    }
    else
      this.tail.watch();
  }

  stop(){
    this.tail?.unwatch();
  }
}