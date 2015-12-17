var utils    = require(pathUtil.join(__dirname,'../commonUtils.js')),
	logger   = require(pathUtil.join(__dirname,'../logger.js'));

var log = logger.initLogger(process.title,false);

process.version = "0.0";			

process.on('SIGTERM', function() {
	log.warn(process.title+": Got kill signal. Exiting.");
	process.exit();
});
	
process.on('uncaughtException', function(err) {
    //log.error('Caught exception: ' + err);
});
	
process.on('message', function(data) {
	if(!utils.isEmpty(data)){
		log.info(process.title+": Received data from parent process.");		
		var parsedData = JSON.parse(data);
	}
});
	
function send(msg){
	if(!debug)
		process.send(msg);
	else
		log.info(msg);
}
	
	/*
	 *
	 *
	 */
	start = function(){		   			

		function processCommand(){
			log.info("Attempting to exectute shell command: "+cmd);
			
			utils.executeCommand(cmd,
				function(cmdResult,msg,stdout){
					log.info(process.title+":"+msg);
					
					if(cmdResult){
						log.info(cmd+" executed successfully.");
					}
					else{
						log.error(cmd+" failed to execute.");
						process.exit(1);
					}
				});
		}

		var debug        = false,
			cmd          = '',
			processTitle = '',			
			logToFile    = false;
		
		process.argv.forEach(function (val, index, array){			
			if(val == '-debug'){
				debug = true;
			}		
			
			if(val == '-log' && array.length>=index+1){	 
				if(process.argv[index+1] == 'true')
					logToFile = true;
			}						
			
			if(val == '-title' && array.length>=index+1){	 
				processTitle = process.argv[index+1];	
			}
			
			if(val == '-cmd' && array.length>=index+1){	 
				cmd = process.argv[index+1];	
			}		
		});
		
		//validate arguments
		if(!utils.isEmpty(processTitle)){//need title
		   process.title = processTitle;
		}
		else{
			log.error(process.title+":Process title is a required argument. Please run with -title")
			process.exit(1);
		}
		
		if(utils.isEmpty(port)){//need port
			log.error(process.title+":The shell command is a required argument. Please run with -cmd");
			process.exit(1);
		}

		if(logToFile){
			log = logger.initLogger(process.title,true);
		}
		
		streamH264Video();
		
	}();