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
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    Player.onConnect(socket);




})

const responseCallback = () => {
    const pack = []
    GameObjects.gameObjectGroup.forEach((obj) => {
        obj.update();
        pack.push({
            x: obj.x, 
            y: obj.y,
            w: obj.w,
            h: obj.h,
            angle: obj.angle,
            imageID : obj.imageID 
        })
        
    })

    for (let key in SOCKET_LIST) {
        let socket = SOCKET_LIST[key]; 
        socket.emit('update', { updatePack: pack });
    }
}

setInterval(responseCallback, 40);