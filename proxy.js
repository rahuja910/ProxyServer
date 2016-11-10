var http      = require('http');
var httpProxy = require('http-proxy');
var request = require('request');
var redis = require('redis');
var fs = require('fs');
var redisServer = fs.readFileSync("/etc/keys/redis.json");
var redisDetails = JSON.parse(redisServer);

var client = redis.createClient(parseInt(redisDetails.redisPort), redisDetails.redisIp, {})

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

	client.exists('scalecount', function(err, reply) {
	    if (reply === 1) {
	    	client.get("scalecount", function(err, reply) {
    			client.set("scalecount", reply+1);
			});
	    } else {
	        client.set("scalecount", 1);
	        client.expire("scalecount",30)
	    }
	});

	client.rpoplpush('servers', 'servers', function(err, value) {

		console.log('Proxy redirected to '+ value);
		proxy.web(req, res, { target: value });
	})
  
})

console.log("Proxy listening on port 8081")
server.listen(8081);