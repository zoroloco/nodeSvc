var winston  = require('winston'),
    pathUtil = require('path'),
	fs       = require('fs'),
	utils    = require(pathUtil.join(__dirname,'./commonUtils.js'));
	
/**
 *
 *
 *
*/
function initLogger(processName,logDir){
	//console.log("Process name="+processName+" log directory="+logDir+"\n");
	
	if(!utils.isEmpty(logDir)){
		
	    //create the log dir if it does not already exist.		
	    try {
		   fs.mkdirSync(logDir);
	    } 
	    catch(e) {
		   if ( e.code != 'EEXIST' ){
			   throw e;
		   }
	    }			
	
		var log = new (winston.Logger)({
		  transports: [
			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
			,new winston.transports.File({ filename: pathUtil.join(logDir,processName+"_"+"error.log"), name:'file.error', 
				level: 'error','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
			,new winston.transports.File({ filename: pathUtil.join(logDir,processName+"_"+"warn.log"), name:'file.warn', 
				level: 'warn','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
			,new winston.transports.File({ filename: pathUtil.join(logDir,processName+"_"+"info.log"), name:'file.info', 
				level: 'info','maxsize':4194304,maxFiles:256, handleExceptions: true,json: false })
		  ],
		  exceptionHandlers: [
			new (winston.transports.Console)({'timestamp' : true,'colorize': true})
			,new winston.transports.File({ filename: pathUtil.join(logDir,processName+"_"+"exception.log"), 
				level: 'error','maxsize':4194304,'maxFiles':256 })
		  ],
		  exitOnError: false
		});		
		
		return log;	
	}
	else{//only console transport
		var log = new (winston.Logger)({
		  transports: [
			new (winston.transports.Console)({'timestamp' : true,'colorize': true})],
		  exitOnError: false
		});		
		
		return log;	
	}
}

exports.initLogger = initLogger;
