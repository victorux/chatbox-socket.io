// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    cors: {
      origin: "https://chatbox-frontend-mu.vercel.app",
      methods: ["GET", "POST"]
    }
  });

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(4200);


let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ 
            userId, 
            socketId,
            status: true,
        });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
}

io.on("connection", (socket) => {
    // when connect
    console.log("a user connected!");
    // take userId and socketId from user;
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });
    
    socket.on("getOnlineUsers", (data) =>{
        io.emit("getOnlineUsers", users);
    })

    // send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        user && io.to(user.socketId)?.emit("getMessage", {
          senderId: senderId,
          text,
        });
      });

    // when disconnect
    socket.on("disconnect", () => {
        removeUser(socket.id);
        io.emit("getUsers", users);
        console.log("a user has been dissconected")
    })
});