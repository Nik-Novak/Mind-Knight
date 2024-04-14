import Tail from '../LineListeners/Tail';
import TailWindows from '../LineListeners/TailWindows';
import LineListener from '../LineListeners/LineListener';
import { OSInfo } from '../OSInfo';
import LogEventEmitter from './LogEventEmitter';
import { ReadLine, ReadLineOptions } from '../LineListeners/ReadLine';

/**
 * Reads a log line by line. Default 1 line per second.
 */
export class LogReader extends LogEventEmitter{
  constructor(options?:Partial<ReadLineOptions>){
    super();
    let lineListener = new ReadLine(this.logpath, options);
    this.start(lineListener);
  }
}