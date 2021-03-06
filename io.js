var socketio = require('socket.io');
var aoslib = require("./lib");

var servers = [];
aoslib.getServerIDs(function (servids) {servers = servids});

module.exports = function(httpserver) {
  socketio(httpserver).on('connection', function (socket) {
    socket.on('getlist', function () {
      var ids = {};
      var done = 0;
      for(i=0; i<servers.length; i++) {
        ids[servers[i]] = {identifier: "", server: "", gamemode: "", map: "", maxplayers: 0, players: 0, name: "", port: 0, status: "offline"};
        aoslib.getServerIdentifier(servers[i], function (serv, id) {
          ids[serv].identifier = id;
          ids[serv].server = serv;
          aoslib.getServerConfig(serv, function (serv, exists, conf) {
            if(!exists) {
              aoslib.getServerIDs(function (servids) {servers = servids});
              ids[serv].gamemode = "Error";
              ids[serv].maxplayers = 0;
              ids[serv].name = "Error: config not found";
              ids[serv].port = 0;
              ids[serv].map = [];
              ids[serv].players = 0;
              done++;
              if(done == servers.length)
                socket.emit('list', ids);
              return;
            }
            ids[serv].gamemode = conf.game_mode;
            ids[serv].maxplayers = conf.max_players;
            ids[serv].name = conf.name;
            ids[serv].port = conf.port;
            aoslib.getAdvancedServerStatus(serv, conf.status_server.port, function(serv, online, map, players) {
              ids[serv].map = map;
              ids[serv].players = players;
              if(online) ids[serv].status = "online";
              done++;
              if(done == servers.length)
                socket.emit('list', ids);
            });
          });
        });
      }
    });
    socket.on('updateserverlist', function () {
      aoslib.getServerIDs(function (servids) {servers = servids});
    });
  });
}