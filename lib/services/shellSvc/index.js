var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "shellSvc";

function ShellSvc(){
	var self = this;
	ShellSvc.super_.call(this);//call Svc constructor
	this._cmd  = '';		
	
	this._log.info("in ShellSvc constructor.");
	
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
}

util.inherits(ShellSvc,Svc);

ShellSvc.prototype.init = function(){
	//TODO: figure out how to use member vars here in init.
	ShellSvc.super_.prototype._log.info("Attempting to execute shell command: "+this._cmd);
	
	utils.executeCommand(this._cmd,
		function(cmdResult,msg,stdout){
			this._log.info(process.title+":"+msg);
			
			if(cmdResult){
				this._log.info(this._cmd+" executed successfully with standard out:"+stdout);
			}
			else{
				this._log.error(_cmd+" failed to execute.");
				process.exit(1);
			}
		});
}

var shellService = new ShellSvc();
//shellService.init();