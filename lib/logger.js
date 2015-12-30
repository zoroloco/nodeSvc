var winston  = require('winston'),
    pathUtil = require('path'),
	fs       = require('fs'),
	utils    = require(pathUtil.join(__dirname,'./commonUtils.js'));
	
process.title = "logger";
	
module.exports = Logger;
function Logger(name){
	var that          = this;	
	
	if(!utils.isEmpty(name)){
		process.title = name;
	}			
		
	//default console logger
	this._log = new (winston.Logger)({
	  transports: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})],
	  exitOnError: false
	});		

	this._log.info("Created console logger for:"+name);	
	
	Logger.prototype.enableFileLogging = function enableFileLogging(logDir){				
		this._log.info(process.title+":Enabling file logging. File names will be prefixed with:"+process.title);
		
		if(!utils.isEmpty(logDir)){
			//create the log dir if it does not already exist.		
			try {
			   this._log.info(process.title+": Creating log directory:"+logDir);
			   fs.mkdirSync(logDir);
			} 
			catch(e) {
			   if ( e.code != 'EEXIST' ){
				   throw e;
			   }
			}			
		
			this._log = new (winston.Logger)({
			  transports: [
				new (winston.transports.Console)({'timestamp' : true,'colorize': true})
				,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"error.log"), name:'file.error', 
					level: 'error','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
				,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"warn.log"), name:'file.warn', 
					level: 'warn','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
				,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"info.log"), name:'file.info', 
					level: 'info','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
			  ],
			  exceptionHandlers: [
				new (winston.transports.Console)({'timestamp' : true,'colorize': true})
				,new winston.transports.File({ filename: pathUtil.join(logDir,process.title+"_"+"exception.log"), 
					level: 'error','maxsize':4194304,'maxFiles':256 })
			  ],
			  exitOnError: false
			});		
		}
		else{
			this._log.error(process.title+": You must specify a log directory. Only console logging will be used.");
		}
	}//init
	
	Logger.prototype.info = function log_info(msg){		
		this._log.info(process.title+":"+msg);							
	}
	
	Logger.prototype.warn = function log_warn(msg){
		this._log.warn(process.title+":"+msg);	
	}
	
	Logger.prototype.error = function log_error(msg){
		this._log.error(process.title+":"+msg);	
	}
	
}//constructor
