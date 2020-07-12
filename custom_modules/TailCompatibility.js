//@ts-check
const fs = require('fs');
const Tail = require('tail').Tail;
class TailCompatibility {
    constructor(filepath, callback, options={maxBuffer: 1024*1024*50, encoding:'utf8'}){
        this.filepath = filepath;
        this.callback = callback;
        this.options=options;
        this.running=false;
    }
  
    tail(){
        if(process.env.NODE_ENV == 'debug')
            console.log('[DEBUG] EXISTING LOG:', fs.readFileSync(this.filepath).toString())
        if(this.running)
            throw Error('Tail was already tailing the file: ' + this.filepath);
        this.running=true;

        let tail = new Tail(this.filepath,{useWatchFile:true, follow:true,});
        var __this = this;
        tail.on('line', function(line){
          if(line.length == 0)
              return;
          if(process.env.NODE_ENV == 'debug')
            console.log('[DEBUG]', line.trim());
          __this.callback(line.trim());
        });
    }
  
    stop(){
        //TODO
    }
  }
  
  module.exports=TailCompatibility;