var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	schedule = require('node-schedule'),
	mysql    = require("mysql"),
	http     = require('http'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "powerballSvc";



function PowerballSvc(){
		
	//helper methods
	function parseResult(winningsStr){		
		function insertWinning(drawDate,wb1,wb2,wb3,wb4,wb5,pb){
			
			self._log.info("Inserting: Draw Date:"+drawDate+" wb1:"+wb1+" wb2:"+wb2+" wb3:"+wb3+" wb4:"+wb4+" wb5:"+wb5+" pb:"+pb);
			
			var winnum = {DRAW_DATE : new Date(Date.parse(drawDate)), 
						  WB1 : wb1, 
						  WB2 : wb2,
						  WB3 : wb3,
						  WB4 : wb4,
						  WB5 : wb5,
						  PB  : pb,
						  CREATED_BY : 'powerballSvc',
						  MODIFIED_DATE: new Date(),
					};
			
			self._con.query('INSERT INTO pb_winnum SET ?',winnum, function(err,res){
				if(err){
					self._log.error("Error inserting data to pb_winnum with error:"+err);
				}
				else{
					self._log.info("Insert successful with ID:"+res.insertId);
				}
			});
		}

		var wordArray = winningsStr.split("  ");

		var firstDate = true;
		for(i = 0; i< wordArray.length; i++){			
			if(wordArray[i].indexOf("/") > -1){//if date field				
				var drawDate = wordArray[i];
				if(firstDate){
					drawDate = wordArray[i].substring(2,wordArray[i].length);//chop off the PP at start.
				}				
			
				insertWinning(drawDate,wordArray[i+1],wordArray[i+2],wordArray[i+3],wordArray[i+4],wordArray[i+5],wordArray[i+6]);
			}
		}
		
		self._con.end(function(err) {
			if(err){
				self._log.error("DB connection closed with error:"+err);
			}
			else{
				self._log.info("DB connection gracefully closed.");
			}		  
		});
	}//parseResult
	
	
	
	//flow
	var self = this;
	PowerballSvc.super_.call(this);//call Svc constructor
	
	var db_host     = '';		
	var db_username = '';
	var db_password = '';
	var db_name     = '';
	
	process.argv.forEach(function (val, index, array){
		if(val == '-dbHost' && array.length>=index+1){	 
			db_host = process.argv[index+1];	
		}		
		if(val == '-dbUsername' && array.length>=index+1){	 
			db_username = process.argv[index+1];	
		}		
		if(val == '-dbPassword' && array.length>=index+1){	 
			db_password = process.argv[index+1];	
		}		
		if(val == '-dbName' && array.length>=index+1){	 
			db_name = process.argv[index+1];	
		}		
	});				
	
	if(utils.isEmpty(db_host) || utils.isEmpty(db_password) || utils.isEmpty(db_username) || utils.isEmpty(db_name)){
		this._log.error("The parameters: -dbHost,-dbUsername,-dbPassword,-dbName are required.");
		process.exit(1);
	}	
	
	this._log.info("Connection info set for database host:"+db_host);
	
	this._con = mysql.createConnection({
		host: db_host,
		user: db_username,
		password: db_password,
		database: db_name
	});						
	
	//define functions	
	PowerballSvc.prototype.startScheduler = function(){
		self._log.info("Starting scheduler. Task will occur at 2:10am nightly.");
		var j = schedule.scheduleJob('10 2 * * *',self.updateWinnings);
	}
	
	PowerballSvc.prototype.refreshData = function(){
		self._log.info("Attempting to wipe data.");
		
		self._con.query('DELETE FROM pb_winnum',
		  function (err, result) {
			if (err){
				self._log.error("Error deleting from table pb_winnum with error:"+err);
			}
			else{
				self._log.info('Successfully deleted ' + result.affectedRows + ' rows' + " from table pb_winnum.");
				
			
			//now query latest
			var options = {host: "www.powerball.com",path:"powerball/winnums-text.txt"};
			
			var options = {   
			  hostname: "www.powerball.com",
			  port: "80",
			  path: "/powerball/winnums-text.txt",
			  method: 'GET'
			 };
			
			self._log.info("Attempting to query data from:"+JSON.stringify(options));
			
			var result = '';
			var req = http.request(options, function(resp){
				resp.on('data',function(chunk){
					result += chunk;
				});
				resp.on('end',function(){
					if(!utils.isEmpty(result)){
						parseResult(result);
					}
				});
			});
			
			req.end();
				
			}//delete success
		  }//delete data callback
		);
	}		
	
	PowerballSvc.prototype.updateWinnings = function(){
		self._log.info("Syncing database to latest powerball winnings.");
		
		self._con.connect(function(err){

		if(err){
			self._log.error("Error connecting to database:"+db_host);
			process.exit(1);
		}
			self._log.info("Successfully connected to database:"+db_host);
			
			//wipe old data
			self.refreshData();			
		});					
	}
}

util.inherits(PowerballSvc,Svc);

var powerballService = new PowerballSvc();
powerballService.updateWinnings();