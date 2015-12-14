var cp      = require('child_process');
var winston = require('winston');
var os      = require('os');

function isWindows(){
	return os.platform == 'win32';
}

function isLinux(){
	return os.platform == 'linux';
}

/**
 *
 *
 *
*/
function initLogger(infoLog,warnLog,errorLog,exceptionsLog){

	var log = new (winston.Logger)({
	  transports: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})
		,new winston.transports.File({ filename: errorLogPath, name:'file.error', 
			level: 'error','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
		,new winston.transports.File({ filename: warnLogPath, name:'file.warn', 
			level: 'warn','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
		,new winston.transports.File({ filename: infoLogPath, name:'file.info', 
			level: 'info','maxsize':131072,maxFiles:256, handleExceptions: true,json: false })
	  ],
	  exceptionHandlers: [
		new (winston.transports.Console)({'timestamp' : true,'colorize': true})
		,new winston.transports.File({ filename: exceptionsLogPath, 
			level: 'error','maxsize':131072,'maxFiles':256 })
	  ],
	  exitOnError: false
	});		
	
	return log;
}

/**
 *
 *
*/
function osDelimeter(){
	if(isWindows())
		return "\\";
	else 
		return "/";
}

/**
 * 
 * @param o
 * @returns {Boolean}
 */
function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}
/**
 * This is used everywhere! careful now.
 * @param v
 * @returns {Boolean}
 */
function isEmpty(v){
	return (v== undefined || v==null || v=='');
}

/**
 *
 * @param cmd 
 * @param cb
*/
function executeCommand(cmd,cb){
	log.info("Attempting to execute command:"+cmd);
	var child = cp.exec(cmd ,function(error,stdout,stderr){
		if (stderr){
			log.error("Error executing command "+cmd+" with stderr:"+stderr);
			cb(false);
		}
		if (error) {
			log.error("Error executing command "+cmd+" with error:"+error);
			cb(false);
		}
		if(stdout){
			log.info(cmd+" successfully executed with no errors.");				
			cb(true);
		}
	});		
}

exports.isNumber       = isNumber;
exports.isEmpty        = isEmpty;
exports.executeCommand = executeCommand;
exports.initLogger     = initLogger;
exports.isWindows      = isWindows;
exports.isLinux        = isLinux;
exports.osDelimeter    = osDelimeter;