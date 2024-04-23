import LogEventEmitter from './LogEventEmitter';
import { ReadLine, ReadLineOptions } from '../LineListeners/ReadLine';

type LogReaderOptions = ReadLineOptions & {
  logpath: string
}
/**
 * Reads a log line by line. Default 1 line per second.
 */
export class LogReader extends LogEventEmitter{
  constructor(options?:Partial<LogReaderOptions>){
    if(options?.logpath)
      super(options.logpath, '');
    else
      super();
    let lineListener = new ReadLine(this.logpath, options);
    this.start(lineListener);
  }
}