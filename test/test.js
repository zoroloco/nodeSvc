var nodeService = require('nodesvc');

//below, have a config file and object for every type of test.

//var testSvc = new nodeService.nodesvc(require('./conf.json'));
var testSvc = new nodeService.nodesvc();

testSvc.startServices();
