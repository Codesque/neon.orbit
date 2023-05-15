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
        const hashedUsername = await bcrypt.hash(username, 10);
        const newUser = Accounts.create({
            username,
            password: hashedPassword, 
            isOnline: false,
            interactionID : hashedUsername
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




const loginUser = asyncHandler(async (data, socket) => {
    try {
        const { username, password } = data; 
        if (!username || !password) {
            return false;
        }
    
        const user = await Accounts.findOne({ username });
        if (user && bcrypt.compare(password, user.password)) {  
            console.log(`user id is ${socket.id}`);
            //await Accounts.findByIdAndUpdate(user.id, { isOnline: true });
            
            Player.onConnect(socket , user.interactionID); 
            socket.emit('sign-in-response', { success: true })
             
            
            
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
    registerUser

}