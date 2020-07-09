//@ts-check
const fs = require('fs');
const path = require('path')
const util = require('util');
class Logger {
  constructor(){
    
  }
  cloneOutputToFile(logPath, options={}){
    if(options.wipe && fs.existsSync(logPath))
      fs.unlinkSync(logPath);
    if( !fs.existsSync(path.join(logPath, '../')) )
        fs.mkdirSync(path.join(logPath, '../'));
    var logFile = fs.createWriteStream(logPath, { flags: 'a' });
    // Or 'w' to truncate the file every time the process starts.
    var logStdout = process.stdout;

    console.log = function () {
      logFile.write(util.format.apply(null, arguments) + '\n');
      logStdout.write(util.format.apply(null, arguments) + '\n');
    }
    console.error = console.log;
  }
}

module.exports = Logger;