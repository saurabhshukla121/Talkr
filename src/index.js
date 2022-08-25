const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {generateMessage,generateLocationMessage} = require("./message");
const {addUser,removeUser,getUser,getUsersInRoom} = require("./users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);  

const port = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) =>{
    console.log("New WebSocket connection");

    socket.on("join",({username,room} ,callback) =>{
      const {error ,user} = addUser({id: socket.id, username, room});

      if(error) return callback(error);

      socket.join(user.room);

      socket.emit("message",generateMessage("Welcome!"));
      socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} joined the room`));
      io.to(user.room).emit("users-room", {
          room: user.room,
          users: getUsersInRoom(user.room)
      })
    })

    socket.on("send-message", (message,callback) =>{
        const user = getUser(socket.id);

        io.to(user.room).emit("message",generateMessage(user.username,message));
        callback("Delivered!");
    })

    socket.on("send-location", (location,callback) =>{
        const user = getUser(socket.id);
        io.to(user.room).emit("location-message",generateLocationMessage(user.username,`https://google.com/maps?q=${location.lat},${location.long}`));
        callback("location send!");
    })

    socket.on("disconnect",() =>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message",generateMessage(`${user.username} left the room`));
            io.to(user.room).emit("users-room", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })   
        }
    })
})

server.listen(port, () =>{
    console.log(`Server is running on ${port}`);
})