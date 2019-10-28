const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const { addUser, removeUser, getUser, seeUsers, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router)
app.use(cors)

io.on('connection',(socket)=>{
    socket.on('join', ({name, room}, callback)=>{
        console.log("got request to join")
        const {error, user} = addUser({id:socket.id, name, room});

        if (error) return callback(error);
        // to welcome the user that just joined
        socket.emit('message', {user: 'admin', text:`${user.name}, welcome to room: ${user.room}`})
        // to let everyone else in the room know the user has joined
        socket.broadcast.to(user.room).emit('message',{user:'admin', text: `${user.name} has joined`}) 

        io.to(user.room).emit('roomData', {room: user.room}, {users: getUsersInRoom(user.room)});

        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            console.log("error socket: ", socket.id, " user: ", seeUsers())
            return;
        }

        io.to(user.room).emit('message', {user:user.name, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback(); // good practice to always call the callback
    })
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if (user){
            io.to(user.room).emit('message',{user:"admin", text:`${user.name} has left.`})
        }
    })
})


server.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));
