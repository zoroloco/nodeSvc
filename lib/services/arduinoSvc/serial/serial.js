var cp       = require('child_process'),
    pathUtil = require('path');

function Serial(log){
	var self  = this;
	this._log = log;
	
	Serial.prototype.init = function(){
		this._log.info("Initializing serial connection.");

		var p = "python "+path.join(__dirname,"/scripts/serial.py");
		_log.info("Spawning Python process: "+p);
		
		/*
		var child = cp.spawn(cmd ,function(error,stdout,stderr){
			if (stderr){
				cb(false,"Error executing command "+cmd+" with stderr:"+stderr);
			}
			if (error) {
				cb(false,"Error executing command "+cmd+" with error:"+error);
			}
			if(stdout){
				cb(true,cmd+" successfully executed with no errors.",stdout);
			}
		});		
		*/
		
	}
}