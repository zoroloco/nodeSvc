var pathUtil = require('path'),
    utils    = require(pathUtil.join(__dirname,'../commonUtils.js')),
	logger   = require(pathUtil.join(__dirname,'../logger.js')),
    net      = require('net'),
    chokidar = require('chokidar'),
    fs       = require('fs');

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
		
		function deleteFile(filePath){
			fs.unlink(filePath,function(err){
				if(err){
					log.error(process.title+":Error deleting file:"+filePath);
					throw err;
				}
				else{
					log.info(process.title+":Successfully deleted file:"+filePath);
				}
			});
		}//deleteFile
		
		function getPrintCmd(filePath){
			if(process.platform == 'win32'){
				//return "gsprint -printer "+printerName+" "+filePath;
				log.error("Printing not supported on Windows.");
			}
			else{ //linux
				log.info("Printing file:"+filePath);
			}
			
			return null;
		}
		
		function processFileAdd(filePath){
			if(fs.statSync(filePath).isFile()){
				var printCmd = getPrintCmd(filePath);
				if(!utils.isEmpty(printCmd)){
					utils.executeCommand(printCmd,
					function(cmdResult,msg,stdout){
						log.info(process.title+":"+msg);
						
						if(cmdResult){
							log.info(process.title+":"+filePath+" printed successfully with standard output:"+stdout);
							if(deleteFiles){
								log.info("Attempting to delete printed file:"+filePath);
								deleteFile(filePath);
							}
							else{
								log.info("Attempting to move "+filePath+" to printed folder.");
								
							}
						}
						else{
							log.error(process.title+":"+filePath+" did not print.");
						}
					});									
				}										
			}			
			else{
				log.error(process.title+":"+filePath+" does not exist. Cannot print.");
			}
		}//processFileAdd
		
		function createFolders(){
			try 
			{
				fs.mkdirSync(pathUtil.join(watchDir,"errors"));
				log.info("Successfully created errors folder.");
				fs.mkdirSync(pathUtil.join(watchDir,"printed"));
				log.info("Successfully created printed folder.");
			} 
			catch(e) {
				if ( e.code != 'EEXIST' ){ 
					throw e;
				}
    		}						
		}

		function watchDirectory(){
			var watcher = chokidar.watch(watchDir, {
			  ignored: /[\/\\]\./, 
			  persistent: true,
			  ignoreInitial : true,
			  awaitWriteFinish: true
			});
			
			log.info(process.title+":Now watching:"+watchDir+" for new files.");
			
			watcher.on('add', function(path) { 
				log.info(process.title+":File "+path+" has been added.");								
				processFileAdd(path);
			})		  
		}//watchDir
		

		var debug        = false,
			deleteFiles  = false,
			printerName  = '',
			processTitle = '',			
			watchDir     = '',
			logToFile    = false;
		
		process.argv.forEach(function (val, index, array){			
			if(val == '-debug'){
				debug = true;
			}
			
			if(val == '-watchDir' && array.length>=index+1){	 
				watchDir = process.argv[index+1];	
			}
			
			if(val == '-log' && array.length>=index+1){	 
				if(process.argv[index+1] == 'true')
					logToFile = true;
			}
			
			if(val == '-deleteFiles' && array.length>=index+1){	 
				deleteFiles = process.argv[index+1];	
			}
			
			if(val == '-title' && array.length>=index+1){	 
				processTitle = process.argv[index+1];	
			}
			
			if(val == '-printerName' && array.length>=index+1){	 
				printerName = process.argv[index+1];	
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
		
		if(utils.isEmpty(printerName)){//need printer name
			log.error(process.title+":Printer name is a required argument. Please run with -printerName");
			process.exit(1);
		}

		if(logToFile)
			log = logger.initLogger(process.title,true);
		
		if(utils.isEmpty(watchDir)){//need watchDir
			log.error(process.title+":Watch directory is a required argument. Please run with -watchDir");
			process.exit(1);			
		}
		else{
			try{
				if(fs.statSync(watchDir).isDirectory()){
					createFolders();
					watchDirectory();	
				}	
				else{
					log.error(process.title+": Watch directory:"+watchDir+" does not exist on the file system.");
					process.exit(1);
				}
			}
			catch(e){
				log.error(process.title+":"+e);
				process.exit(1);
			}
		}
		
	}();