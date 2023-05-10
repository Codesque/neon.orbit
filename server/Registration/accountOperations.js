const asyncHandler = require('express-async-handler'); 
const bcrypt = require('bcrypt');
const {Player} = require('../GameLogic/player.js');

const Accounts = require('../Models/registrationModel.js'); 


const registerUser = asyncHandler(async (data, socket) => {
    try {
        const { username, password } = data;
    
        if (!username || !password) {
            
            socket.emit('sign-up-response', { success: false });
            return false;
        }
        
        const userAvalible = await Accounts.findOne({ username });
        if (userAvalible) {
            
            socket.emit('sign-up-response', { success: false });
            return false;
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = Accounts.create({
            username,
            password: hashedPassword, 
            isOnline : false 
        });
    
        console.log(`New User ${newUser.username} has been created successfully`);
        if (newUser) {
            socket.emit('sign-up-response', { success: true });
            return true;
    
        }
        else {
            socket.emit('sign-up-response', { success: false });
            return false;
        }

    }
    catch (err) {
        console.log(err);
    }
    
        

})

const disconnectUser = asyncHandler(async (socket) => {
    await Accounts.findByIdAndUpdate(socket.id, { isOnline: false });
})


const loginUser = asyncHandler(async (data, socket) => {
    try {
        const { username, password } = data; 
        if (!username || !password) {
            return false;
        }
    
        const user = await Accounts.findOne({ username });
        if (user && bcrypt.compare(password, user.password)) {
            socket.id = user.id;   
            console.log(`user id is ${user.id}`);
            if (!user.isOnline) { 
                await Accounts.findByIdAndUpdate(user.id, { isOnline: true });
                Player.onConnect(socket); 
                socket.emit('sign-in-response', { success: true })
                return true;  
            }
            else socket.emit('sign-in-response' ,{success : false}) 
            
        }
        else {
            socket.emit('sign-in-response', { success: false });
            return false;
        }
        
    } catch (err) {
        console.log(err);
    }
})


module.exports = {

    loginUser, 
    registerUser, 
    disconnectUser

}