//ExpressJS :yerel dosyalarla yapilan network islemlerini kolaylastiran bir frameworktur. 
const express = require('express');

// NodeJs ile birlikte gelen dosya yolu kutuphanesi
const path = require('path');

//.env dosyalarinda tanimlanan degiskenleri kullanmak icin kullanilir
const dotenv = require('dotenv').config();

const app = express(); 
const server = require('http').createServer(app);

// buradaki process.env._degiskenAdi_  , .env adli dosyada tanimlanmistir
const PORT = process.env.PORT || 5000; 

const { Player } = require('./server/GameLogic/player');
const { GameObjects } = require('./server/GameLogic/gameObjects');

const connectDb = require('./server/Config/dbConnection.js');
const { loginUser , registerUser } = require('./server/Registration/accountOperations');
const { Ship } = require('./server/GameLogic/ship');
const { gameObjectPackage, shipPackage , collectablePackage } = require('./server/GameLogic/packageManager.js'); 
const { SpaceOre } = require('./server/GameLogic/spaceOre');
const { Collectable } = require('./server/GameLogic/collectableObjects');
connectDb().then(() => {
    
    server.listen(PORT, () => {
        console.log(`Server is listening to ${PORT}`);
    })

});//Veri tabanina baglanmak icin /server/Config/dbConnection.js de  bulunan fonksiyon kullanilir.




//app.use bir middleware'dir
//Express olmadan serverdan clientda bulunan datayi gondermek icin her bir data basina ayri bir get response'u 
//atamamiz gerekirdi. ExpressJS sayesinde client bir yerel dosyayi request ettiginde otomatik olarak response edilir.
app.use('/client', express.static(path.resolve(__dirname, 'client')));


  
app.get('/', (req, res) => { 
    // Eger client hicbir query olmadan request gonderirse client/index.html deki dosyayi response et. 
    res.sendFile(path.resolve(__dirname , 'client' , 'index.html')); 
}) 




let io = require('socket.io')(server, {}); 
let SOCKET_LIST = [];

// Herhangi biri servera baglandiginda baglandigi socket uzerinden asagidaki islemleri yap
io.sockets.on('connection', (socket) => { 
    console.log("Socket Connection");
    let state = false;
    socket.on('sign-in', (data) => { 
        
        state = loginUser(data, socket); 
        if (state) {
            SOCKET_LIST[socket.id] = socket;
            for (let i = 0; i < 15; i++) new SpaceOre(Math.floor(i * Math.random() + 10));

        }

    })


    socket.on('sign-up', (data) => {
        registerUser(data , socket);
    })


    socket.on('disconnect', () => {  
        Player.makeThePlayerDisconnectAgain(socket);
        delete SOCKET_LIST[socket.id];
        console.log(3);
    })

    socket.on('sendMsg2server', (data) => {
        let playerName = "user" + `${socket.id}`.slice(2,7);
        for (let key in SOCKET_LIST)
            SOCKET_LIST[key].emit('add2chat', `${playerName} : ${data}`);


    })
        
    




})

const responseCallback = () => {
    const pack = {};
    const shipPack = {}; 
    const collectablePack = {};

    
    GameObjects.gameObjectGroup.forEach((obj) => {
        obj.update();

        gameObjectPackage(obj, pack , obj.id); 
        shipPackage(obj, shipPack, obj.id);
        collectablePackage(obj, collectablePack, obj.interactionID); 








        
    })

    
    for (let key in SOCKET_LIST) {
        let socket = SOCKET_LIST[key]; 
        socket.emit('update', { updatePack: pack });
        socket.emit('shipUpdate', { updatePack: shipPack });
        socket.emit('collectableUpdate', { updatePack: collectablePack });
        GameObjects.clearTrash();
        
    }
} 

setInterval(responseCallback, 5); 