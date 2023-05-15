import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { CalculateOffset } from "./js/calculateOffset.js";

const socket = io(); 

socket.on('connect', () => {
    const USERID = socket.id;



    let canvas = document.getElementById('gameCanvas'); 
    canvas.width = 960; 
    canvas.height = 470;
    let ctx = canvas.getContext('2d'); 

    const signDiv = {
        input_name: document.getElementById('registration-input-username'), 
        input_password: document.getElementById('registration-input-password'), 
        button_sign_in: document.getElementById('registration-div-signIn'), 
        button_sign_up: document.getElementById('registration-div-signUp'),
        registration_phase: document.getElementById('registration-div')
    } 

    signDiv.button_sign_in.onclick = () => {
        socket.emit('sign-in', { username: signDiv.input_name.value, password: signDiv.input_password.value }); 
    }

    signDiv.button_sign_up.onclick = () => {
        socket.emit('sign-up', { username: signDiv.input_name.value, password: signDiv.input_password.value }); 
    }

    socket.on('sign-in-response', (data) => {
        if (data.success) {
            signDiv.registration_phase.style.display = 'none';
            canvas.style.display = 'inline'; 
        }
        else alert('Hesaba giriş yapma işlemi başarısız oldu.'); 
    })

    socket.on('sign-up-response', (data) => {
        if (data.success) alert('Yeni kullanıcı hesabı başarıyla oluşturuldu');
        else alert('Hesap olusturma islemi basarısız oldu.Lutfen tekrar deneyiniz');
    })

    socket.on('add2chat', (data) => {
        document.getElementById('chat-text').innerHTML += "<div>" + data + "</div>";  
    })
    
    socket.on('evalAnswer', (data) => {
        console.log(data);
    })
    
    const chatFormSubmit = () => {
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        chatForm.onsubmit = function (e) {
            e.preventDefault();
            console.log(chatInput.value);
            if (chatInput.value.startsWith('/'))
                socket.emit('evalServer', chatInput.value);
            else
                socket.emit('sendMsg2server', chatInput.value);
            chatInput.value = "";
        }
    }

    chatFormSubmit();


    const isCollision = (gameObj, mouseEvent, coll_r = 3) => { 
        
        if (gameObj && gameObj.x && gameObj.y) {
            
            const dx = (gameObj.absoluteOffset.x + gameObj.x) - (mouseEvent.offsetX + CalculateOffset.offsetX); 
            const dy = (gameObj.absoluteOffset.y + gameObj.y) - (mouseEvent.offsetY + CalculateOffset.offsetY);
            
            const distance = Math.hypot(dy, dx); 
            const sumOfRadius = gameObj.coll_r + coll_r  // r - w/2
            return (distance < sumOfRadius);

        } 
        return false;


        
        
    }

    const sendCollectableClickedEvent = (e) => {

        let isThereAny = false;
        if (collectableObjects) {
            //console.log("Collectables :", collectableObjects);
            for (let key in collectableObjects) {
                let collectableObj = collectableObjects[key]; 
                let iscoll = isCollision(collectableObj, e, collectableObj.coll_r);
                if (iscoll ) {
                    console.log("This Triggeredddd");
                    socket.emit('MiningProtocol', { who: socket.id, which: key }); 
                    isThereAny = true;
                    break;
                }
                    
                    
                
            }
        }
        return isThereAny;
        
    }

    const sendOtherPlayerClickedEvent = (e, clickNumber = 1, command = 'focus') => {
        // 1 Tiklamada yapilacaklar
        if (e.detail == clickNumber) {
            let isThereAny = false;
            if (otherShipObjects) {
                    
                for (const key in otherShipObjects) {
                    let shipObj = otherShipObjects[key];
                    let isColl = isCollision(shipObj, e);
                    if (isColl) {
                        isThereAny = true;
                        socket.emit('OtherPlayerClicked', { who: USERID, toWhom: key, command: command });
                    }
    
                }
    
            }

            let MapClickCond = (
                !isThereAny && 
                e.offsetX > 0 && 
                e.offsetX < canvas.width && 
                e.offsetY > 0 && 
                e.offsetY < canvas.height

            );
    
    
            if (MapClickCond)
                socket.emit("MapClicked", { x: e.offsetX, y: e.offsetY, c_width: canvas.width, c_height: canvas.height });



        }
    }

    const events = () => {
        
        window.addEventListener('mousedown', (e) => {


            if (sendCollectableClickedEvent(e)) return; 
            else {
                sendOtherPlayerClickedEvent(e, 1, 'focus'); 
                sendOtherPlayerClickedEvent(e, 2, 'attack');
            }

            
        })



    }




    events();





    let self = {};
    let others = [];
    console.log("Socket id :",socket.id);
    socket.on('update', (data) => { 



        let i = 0;
        
        for (let key in data.updatePack) {

            const gameObject = data.updatePack[key];
            

            if ( USERID && USERID == key) { 
                self = {
                    asset : assets[gameObject.imageID],
                    x:gameObject.x,
                    y:gameObject.y,
                    w:gameObject.w,
                    h:gameObject.h,
                    angle:gameObject.angle,
                    ao:gameObject.absoluteOffset
                }
                
            }
            else {
                
                others[i] = {
                    asset: assets[gameObject.imageID],
                    x: gameObject.x,
                    y: gameObject.y,
                    w: gameObject.w,
                    h: gameObject.h,
                    angle: gameObject.angle,
                    ao: gameObject.absoluteOffset
                };
                i += 1;
            }
            
        }
    
    })


    let selfHealthbar = {}; 
    let otherHealthbars = {};
    let otherShipObjects = {};

    socket.on('shipUpdate', (data) => {

        
        for (let key in data.updatePack) {
            
            const shipObj = data.updatePack[key];
            if (socket.id == key) {
                //console.log("x:", shipObj.x, "y:", shipObj.y);
                selfHealthbar = {
                    max_health:shipObj.health,
                    present_health:shipObj.present_health,
                    max_shield:shipObj.shield,
                    present_shield:shipObj.present_shield,
                    x:shipObj.x,
                    y:shipObj.y
                }; 
                
            }
            else {
                otherHealthbars[shipObj.interaction.ID] = {
                    max_health: shipObj.health,
                    present_health: shipObj.present_health,
                    max_shield: shipObj.shield,
                    present_shield: shipObj.present_shield,
                    x: shipObj.x,
                    y: shipObj.y,
                    ao: shipObj.absoluteOffset
                };

                otherShipObjects[shipObj.interaction.ID] = {
                    x: shipObj.x,
                    y: shipObj.y, 
                    absoluteOffset: shipObj.absoluteOffset,
                    coll_r: shipObj.collusion_radius, 
                    w: shipObj.w, 
                    h: shipObj.h 
                }


            }
            

        }

        
        
    })

    let collectableObjects = {};

    socket.on('collectableUpdate', (data) => {
        for (let key in data.updatePack) {
            
            const collectableObj = data.updatePack[key]; 
            collectableObjects[key] = {
                x: collectableObj.x, 
                y: collectableObj.y,
                w: collectableObj.w,
                h: collectableObj.h,
                coll_r: collectableObj.coll_r,
                absoluteOffset: collectableObj.absoluteOffset
            }

        }
    })



    socket.on('offset', (data) => {
        CalculateOffset.updateOffset(data.x, data.y);
    })



    socket.on('PlayerDestroyed', (data) => {
        if (data.success) {
            
            document.getElementById('gameOverScreen').style.display = "block";
            
        }
            

    })


    
    const rotatedDraw = (image, x, y, w, h, angle) => {
        if (!image) return;
        let x_origin = x; 
        let y_origin = y; 

        ctx.save()
    
        ctx.translate(x_origin, y_origin); 
        ctx.rotate(angle);// Radyan turunden olmali 
        ctx.drawImage(image, -w/2, -h/2, w , h); 
        ctx.restore();
        //ctx.rotate(-angle);
        //ctx.translate(-x_origin, -y_origin);

    }

    const drawBackground = (bgID = 'bg0') => {
        if (!assets) return;
        const image = assets[bgID];
        image.style.width = "3052"; 
        image.style.height = "2028";
        ctx.drawImage(image,-CalculateOffset.offsetX , -CalculateOffset.offsetY  , 3052 , 2028); //1526 1014
    }

    const drawGameObjects = () => {
        if (self) {
            rotatedDraw(self.asset, self.x, self.y, self.w, self.h, (self.angle + 90) * Math.PI / 180);
        }

        for (const key in others) {
            const gameObj = others[key];
            rotatedDraw(gameObj.asset, gameObj.x + gameObj.ao.x - CalculateOffset.offsetX,
                gameObj.y + gameObj.ao.y - CalculateOffset.offsetY, gameObj.w, gameObj.h,
                (gameObj.angle + 90) * Math.PI / 180);
        }

    }

    const drawHealthBars = () => {
        const shieldbar_y_offset = 72;
        const healthbar_y_offset = 66;
        const present_health_bar = assets['present_health'];
        const healthbar_template = assets['health_mono'];
        const present_shield_bar = assets['present_shield']
        const shieldbar_template = assets['shield_mono'];
        let bar_widthMax = 96; 
        let bar_height = 6;
        if (selfHealthbar) { 
            //const [health, present_health , shield , present_shield, x, y] = selfHealthbar;
            
            ctx.drawImage(healthbar_template, selfHealthbar.x  - bar_widthMax/2, selfHealthbar.y - healthbar_y_offset  - bar_height/2  , bar_widthMax , bar_height);
            ctx.drawImage(shieldbar_template, selfHealthbar.x - bar_widthMax/2, selfHealthbar.y - shieldbar_y_offset - bar_height/2 , bar_widthMax , bar_height);

            let hp_width = 96 * (selfHealthbar.present_health / selfHealthbar.max_health);
            let shield_width = 96 *(selfHealthbar.present_shield / selfHealthbar.max_shield); 

            ctx.drawImage(present_health_bar, selfHealthbar.x -bar_widthMax/2, selfHealthbar.y  -healthbar_y_offset  - bar_height/2 , hp_width , bar_height); 
            ctx.drawImage(present_shield_bar, selfHealthbar.x - bar_widthMax/2, selfHealthbar.y - shieldbar_y_offset - bar_height/2, shield_width , bar_height);
             



        }


        for (const key in otherHealthbars) {

            const shipObj = otherHealthbars[key];
            let hp_width = 96 * (shipObj.present_health / shipObj.max_health);
            let shield_width = 96 * (shipObj.present_shield / shipObj.max_shield); 


            if (shield_width > 1) {
                ctx.drawImage(shieldbar_template, shipObj.x + shipObj.ao.x - CalculateOffset.offsetX -bar_widthMax/2 , shipObj.y +shipObj.ao.y -CalculateOffset.offsetY -shieldbar_y_offset -bar_height/2 , bar_widthMax , bar_height);
                ctx.drawImage(present_shield_bar, shipObj.x + shipObj.ao.x - CalculateOffset.offsetX - bar_widthMax / 2, shipObj.y + shipObj.ao.y - CalculateOffset.offsetY - shieldbar_y_offset - bar_height / 2, shield_width, bar_height);
                
                
            }

            if (hp_width > 1) {
                ctx.drawImage(healthbar_template, shipObj.x + shipObj.ao.x - CalculateOffset.offsetX - bar_widthMax / 2, shipObj.y + shipObj.ao.y - CalculateOffset.offsetY - healthbar_y_offset - bar_height / 2, bar_widthMax, bar_height);
                ctx.drawImage(present_health_bar, shipObj.x + shipObj.ao.x - CalculateOffset.offsetX - bar_widthMax / 2, shipObj.y + shipObj.ao.y - CalculateOffset.offsetY - healthbar_y_offset - bar_height / 2, hp_width, bar_height);
                
            }

            //else socket.emit('ShipDestroyed', { data: socket.id });
            
        }

    }

    const debug = (col_x , col_y , col_rad , startDeg=0 , endDeg = 2* Math.PI) => {
        ctx.beginPath(); 
        ctx.arc(
            col_x, col_y,
            col_rad,
            startDeg, endDeg
        ); 
        ctx.save() // start applying private drawings from here
        ctx.stroke();
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.restore() // start applying private drawings from here 
    }


    function animate(timeStamp) { 

        ctx.clearRect(0, 0, 960, 470);
        drawBackground();
        drawGameObjects();
        drawHealthBars();
        //for(let key in collectableObjects) debug(collectableObjects[key].x +collectableObjects[key].absoluteOffset.x - CalculateOffset.offsetX ,collectableObjects[key].y+ collectableObjects[key].absoluteOffset.y - CalculateOffset.offsetY , collectableObjects[key].coll_r )
        requestAnimationFrame(animate);
        
    }


    setInterval(requestAnimationFrame(animate), 30);
    
    
} )


