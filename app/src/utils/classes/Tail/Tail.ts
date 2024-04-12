import {Tail as LinuxTail, TailOptions} from 'tail';

type Callback = (line:string)=>void

export default abstract class Tail {
  protected listeners:Callback[] = [];
  constructor(protected filepath:string){
  }

  addListener(callback:Callback){
    this.listeners.push(callback);
    return this;
  }

  abstract start():void

  abstract stop():void
}