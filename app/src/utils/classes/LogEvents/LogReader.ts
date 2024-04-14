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
    super();
    let lineListener = new ReadLine(options?.logpath || this.logpath, options);
    this.start(lineListener);
  }
}