var pathUtil = require('path'),
    utils    = require(pathUtil.join(__dirname,'../commonUtils.js')),
	logger   = require(pathUtil.join(__dirname,'../logger.js')),
    net      = require('net'),
    chokidar = require('chokidar'),
    fs       = require('fs');
    
process.version = "1.0";			

process.on('SIGTERM', function() {
	log.warn(process.title+": Got kill signal. Exiting.");
	process.exit();
});
	
process.on('message', function(data) {
	if(!utils.isEmpty(data)){
		log.info(process.title+": Received data from parent process.");		
		var parsedData = JSON.parse(data);
	}
});
	
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
			if(process.platform == 'win32')
				return "gsprint -printer "+printerName+" "+filePath;
			else //linux
				return "";//use CUPS
		}
		
		function processFileAdd(filePath){
			fs.exists(filePath, function (exists) {
				if(exists){															
					utils.executeCommand(getPrintCmd(filePath),
						function(result,msg){
							log.info(process.title+":"+msg);
							
							if(result){
								log.info(process.title+":"+filePath+" printed successfully.");
								deleteFile(filePath);
							}
							else{
								log.error(process.title+":"+filePath+" did not print.");
							}
						});																																					
				}
				else{
					log.error(process.title+":"+filePath+" does not exist. Cannot print.");
				}
			});			
		}//processFileAdd

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
		

		var log,
		    debug        = false,
			deleteFiles  = false,
			printerName  = '',
			processTitle = '',			
			watchDir     = '';
		
		process.argv.forEach(function (val, index, array){			
			if(val == '-debug'){
				debug = true;
			}
			
			if(val == '-watchDir' && array.length>=index+1){	 
				watchDir = process.argv[index+1];	
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
			console.log(process.title+":Process title is a required argument. Please run with -title")
			process.exit(1);
		}
		
		if(utils.isEmpty(printerName)){//need printer name
			console.log(process.title+":Printer name is a required argument. Please run with -printerName");
			process.exit(1);
		}

		log = logger.initLogger(process.title);
		
		if(utils.isEmpty(watchDir)){//need watchDir
			log.error(process.title+":Watch directory is a required argument. Please run with -watchDir");
			process.exit(1);			
		}
		else{
			watchDirectory();
		}
		
	}();