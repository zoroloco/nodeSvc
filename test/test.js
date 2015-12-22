var nodeService = require('nodesvc');

var testConfig = {};

var svcMgr = new nodeService(testConfig);

svcMgr.startServices();
