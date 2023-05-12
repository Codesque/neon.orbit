//ExpressJS :yerel dosyalarla yapilan network islemlerini kolaylastiran bir frameworktur. 
const express = require('express');

// NodeJs ile birlikte gelen dosya yolu kutuphanesi
const path = require('path');

//.env dosyalarinda tanimlanan degiskenleri kullanmak icin kullanilir
const dotenv = require('dotenv').config();

const app = express(); 
const server = require('http').createServer(app);

// buradaki process.env._degiskenAdi_  , .env adli dosyada tanimlanmistir
const port = process.env.PORT || 5000; 

const { Player } = require('./server/GameLogic/player');
const { GameObjects } = require('./server/GameLogic/gameObjects');

const connectDb = require('./server/Config/dbConnection.js');
const { loginUser , registerUser , disconnectUser} = require('./server/Registration/accountOperations');
const { Ship } = require('./server/GameLogic/ship');
const { gameObjectPackage , shipPackage} = require('./server/GameLogic/packageManager.js');
connectDb();//Veri tabanina baglanmak icin /server/Config/dbConnection.js de  bulunan fonksiyon kullanilir.




//app.use bir middleware'dir
//Express olmadan serverdan clientda bulunan datayi gondermek icin her bir data basina ayri bir get response'u 
//atamamiz gerekirdi. ExpressJS sayesinde client bir yerel dosyayi request ettiginde otomatik olarak response edilir.
app.use('/client', express.static(path.resolve(__dirname, 'client')));


  
app.get('/', (req, res) => { 
    // Eger client hicbir query olmadan request gonderirse client/index.html deki dosyayi response et. 
    res.sendFile(path.resolve(__dirname , 'client' , 'index.html')); 
}) 
server.listen(port, () => {
    console.log(`Server is listening to ${port}`);
})

let io = require('socket.io')(server, {}); 
let SOCKET_LIST = [];

// Herhangi biri servera baglandiginda baglandigi socket uzerinden asagidaki islemleri yap
io.sockets.on('connection', (socket) => { 
    console.log("Socket Connection");
    let state = false;
    socket.on('sign-in', (data) => { 
        
        state = loginUser(data, socket); 

        if (SOCKET_LIST[socket.id]) {
            socket.emit('playerIsAlreadyInGame', {data : true});
            return null;
        }

        SOCKET_LIST[socket.id] = socket;
    })


    socket.on('sign-up', (data) => {
        registerUser(data , socket);
    })


    socket.on('disconnect', () => {  
        Player.makeThePlayerDisconnectAgain(socket);
        delete SOCKET_LIST[socket.id];
        console.log(3);
    })
        
    




})

const responseCallback = () => {
    const pack = {};
    const shipPack = {}; 

    
    GameObjects.gameObjectGroup.forEach((obj) => {
        obj.update();

        gameObjectPackage(obj, pack , obj.id); 
        shipPackage(obj, shipPack, obj.id);






        
    })

    
    for (let key in SOCKET_LIST) {
        let socket = SOCKET_LIST[key]; 
        socket.emit('update', { updatePack: pack });
        socket.emit('shipUpdate', { updatePack: shipPack });
        
    }
} 

setInterval(responseCallback, 5); 