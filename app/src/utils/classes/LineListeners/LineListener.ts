type Callback = (line:string)=>void

export default abstract class LineListener {
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