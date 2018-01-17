var express = require('express');
var app = new express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);
app.use('/static', express.static(__dirname +'/public/media/'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/assets/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

console.log("open http://localhost:3000 in a new browser window ");

var users = [];

var host = null;
io.on("connection", function(socket){

  socket.emit('welcome','Socket #'+ socket.id);
  
  socket.on("user_onboard", function(user)
  {
    users.push({id : socket.id, name : user.name , host : false});  

    if(host ===null)
     {
       host = users[0];   
       host.host = true;
     }
    
    socket.join(socket.id); 
    io.sockets.emit("refresh_users", users);   //  socket.broadcast.emit will emit all clients except this connected socket
  });

  socket.on("slide_update", function (slideIndex) {
    console.log("slide_update -> " + slideIndex);
    socket.broadcast.emit("slide_update", slideIndex);
  });

  socket.on("change_host", function(hostId){    
   
    console.log("Host change -> "+ hostId);
    if(host != null)
      host.host = false;
    
      host =  users.filter(x=>x.id == hostId)[0]
      host.host = true;

      io.sockets.emit("refresh_users", users);  
      console.log(users);
  });
 
  socket.on("disconnect", function(data)
  {
    users = users.filter(x=>x.id!== socket.id);

    if(host.id === socket.id)
    {      
      host =  users.length>0? users[0] : null;
      if(host!=null)
      host.host = true;
    }   

    io.sockets.emit("refresh_users", users);  
    
  });  

});



