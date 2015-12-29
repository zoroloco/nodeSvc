
var nodeService = require('../lib/nodesvc.js');

var testSvc = new nodeService(require('./conf.json'));

testSvc.startServices();
