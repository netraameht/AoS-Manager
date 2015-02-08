var app = require('express')();
var httplib = require('http');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var aoslib = require("./aoslib");
var servers = []; 
getServerIDs(function (servids) {servers = servids});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/web/list.html');
});

app.get('/favicon.ico', function(req, res){
  res.sendFile(__dirname + '/web/favicon.ico');
});

app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/web/style.css');
});

http.listen(80, function(){
  console.log('listening on *:80');
});

io.on('connection', function (socket) {
  socket.on('getlist', function () {
    var ids = {};
    var done = 0;
    for(i=0; i<servers.length; i++) {
      ids[servers[i]] = {identifier: "", server: "", gamemode: "", map: "", maxplayers: 0, players: 0, name: "", port: 0};
      getID(servers[i], function (serv, id) {
        ids[serv].identifier = id;
        ids[serv].server = serv;
        getConfig(serv, function (serv, conf) {
          ids[serv].gamemode = conf.game_mode;
          ids[serv].maxplayers = conf.max_players;
          ids[serv].name = conf.name;
          ids[serv].port = conf.port;
          getStatus(serv, conf.status_server.port, function(serv, map, players) {
            ids[serv].map = map;
            ids[serv].players = players;
            done++;
            if(done == servers.length) {
              socket.emit('list', ids);
            }
          });
        });
      });
    }
  });
});