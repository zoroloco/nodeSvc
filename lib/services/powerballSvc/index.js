var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	schedule = require('node-schedule'),
	mysql    = require("mysql"),
	http     = require('http'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "powerballSvc";

function PowerballSvc(){
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
	
	PowerballSvc.prototype.deleteData = function(){
		self._log.info("Attempting to wipe data.");
		
		self._con.query('DELETE FROM PB_WINNUM',
		  function (err, result) {
			if (err){
				self._log.error("Error deleting from table pb_winnum with error:"+err);
			}
			else{
				self._log.info('Successfully deleted ' + result.affectedRows + ' rows' + " from table pb_winnum.");
			}
		  }
		);
	}
	
	PowerballSvc.prototype.queryData = function(){
		var urlPath = "www.powerball.com/powerball/winnums-text.txt";
		self._log.info("Attempting to query data from:")
		
		http.get(urlPath, (res) => {
		  self._log.info("Successfully did a get request on:"+urlPath+" and got status code:"+res.statusCode);		  
		  res.resume();
		}).on('error', (e) => {
		  self._log.error("Got error during http get request of:"+urlPath+" with error:"+e.message);
		});
	}
	
	PowerballSvc.prototype.closeConnection = function(){
		self._con.end(function(err) {
			if(err){
				self._log.error("DB connection closed with error:"+err);
			}
			else{
				self._log.info("DB connection gracefully closed.");
			}		  
		});
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
			self.deleteData();
			//query new data
			self.queryData();
			//close db connection
			self.closeConnection();
		});					
	}
}

util.inherits(PowerballSvc,Svc);

var powerballService = new PowerballSvc();
powerballService.updateWinnings();