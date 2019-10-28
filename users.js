const users = [];

const addUser = ({id, name, room}) =>{ // id is the socket instance
    // reformat Name to remove space

    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check if there's an existing user
    const existingUser = users.find((user) => user.room === room && user.name === name);
    
    if (existingUser) {
        return {error: 'Username is taken'}
    }

    const user = { id, name, room};
    users.push(user);

    return {user};
}

const seeUsers = () => users;

const removeUser = (id) =>{
    const index = users.findIndex(user => user.id === id);

    if (index !== -1){
        return users.splice(index,1)[0]; // [0] to return the spliced user
    }
}

// just returns the user 
const getUser = (id) => users.find(user => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom, seeUsers
};