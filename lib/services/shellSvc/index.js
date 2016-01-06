var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "shellSvc";

function ShellSvc(){
	var self = this;
	ShellSvc.super_.call(this);//call Svc constructor
	this._cmd  = '';		
	
	process.argv.forEach(function (val, index, array){
		if(val == '-cmd' && array.length>=index+1){	 
			self._cmd = process.argv[index+1];	
		}		
	});				
	
	if(utils.isEmpty(this._cmd)){
		this._log.error("The shell command is a required argument. Please specify with the argument -cmd");
		process.exit(1);
	}	
	else{
		this._log.info("Command set to:"+this._cmd);
	}
	
	ShellSvc.prototype.init = function(){
		self._log.info("Attempting to execute shell command: "+self._cmd);
		
		utils.executeCommand(self._cmd,
			function(cmdResult,msg,stdout){
				self._log.info(process.title+":"+msg);
				
				if(cmdResult){
					self._log.info(self._cmd+" executed successfully with standard out:"+stdout);
				}
				else{
					self._log.error(self._cmd+" failed to execute.");
					process.exit(1);
				}
			});
	}
}

util.inherits(ShellSvc,Svc);

var shellService = new ShellSvc();
shellService.init();