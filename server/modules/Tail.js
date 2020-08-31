class Tail{
    constructor(filepath, callback, options={maxBuffer: 1024*1024*50, encoding:'utf8'}){
        this.filepath = filepath;
        this.callback = callback;
        this.options=options;
        this.running=false;
    }
  
    start(){
        if(this.running)
            throw Error('Tail was already tailing the file: ' + this.filepath);
        this.running=true;
        var __this = this;
        let exec = require('child_process').exec;
        let tailCommand = exec('PowerShell -Command Get-Content ' + this.filepath + ' –Wait -Tail 1 -Encoding UTF8', this.options);
        tailCommand.stdout.on('data', function(data) {
            let lines = data.split('\n');
            lines.forEach( line => {
                if(line.length == 0)
                    return;
                // console.log(line.trim());
                __this.callback(line.trim());
            } );
        });
    }
  
    stop(){
        //TODO
    }
  }
  
  module.exports=Tail;