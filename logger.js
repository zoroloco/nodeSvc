var winston = require('winston'),
    pathUtil = require('path');

/**
 *
 *
 *
*/
function initLogger(processName){
	var logFilePath = pathUtil.join(__dirname,'logs');

	var log = new (winston.Logger)({
	  transports: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})
		,new winston.transports.File({ filename: pathUtil.join(logFilePath,processName+"_"+"error.log"), name:'file.error', 
			level: 'error','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
		,new winston.transports.File({ filename: pathUtil.join(logFilePath,processName+"_"+"warn.log"), name:'file.warn', 
			level: 'warn','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
		,new winston.transports.File({ filename: pathUtil.join(logFilePath,processName+"_"+"info.log"), name:'file.info', 
			level: 'info','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
	  ],
	  exceptionHandlers: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})
		,new winston.transports.File({ filename: pathUtil.join(logFilePath,processName+"_"+"exception.log"), 
			level: 'error','maxsize':131072,'maxFiles':256 })
	  ],
	  exitOnError: false
	});		
	
	return log;
}

exports.initLogger = initLogger;
