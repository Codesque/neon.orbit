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

    socket.on('playerIsAlreadyInGame', (data) => {
        location.reload();
    });

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



    const isCollision = (gameObj , mouseEvent) => {
        const dx = (gameObj.absoluteOffset.x + gameObj.x) - (mouseEvent.offsetX + CalculateOffset.offsetX); 
        const dy = (gameObj.absoluteOffset.y + gameObj.y) - (mouseEvent.offsetY + CalculateOffset.offsetY);
        
        const distance = Math.hypot(dy, dx); 
        const sumOfRadius = gameObj.coll_rad + 25 // Buradaki 128 tiklama yaricapi


        


        return (distance < sumOfRadius);

        
        
    }

    const events = () => {
        
        window.addEventListener('mousedown', (e) => {

            let isThereAny = false;
            if (otherShipObjects) {
                
                for (const key in otherShipObjects) {
                    let shipObj = otherShipObjects[key]; 
                    let isColl = isCollision(shipObj , e);
                    if (isColl) {
                    isThereAny = true;
                    socket.emit('OtherPlayerClicked', { who: USERID, toWhom: key });  
                    }
                        

                }

            } 


            if(!isThereAny && e.offsetX < canvas.width && e.offsetY < canvas.height)
                socket.emit("MapClicked", { x: e.offsetX, y: e.offsetY, c_width: canvas.width, c_height: canvas.height });
            
        })



    }




    events();


    const addAttributes = (image, data_attributes) => {
        for (let key in data_attributes) {
            //console.log(key);
            if (key == "isClickable") {
                //console.log('This works fine');
                image.addEventListener('onclick', (e) => {
                    console.log("I am Clickable");
                })
            }


        }

        return image;

    }



    let self = [];
    let others = [];
    console.log("Socket id :",socket.id);
    socket.on('update', (data) => { 




        
        for (let key in data.updatePack) {

            const gameObject = data.updatePack[key];
            

            if ( USERID && USERID == key) { 
                self = [
                    assets[gameObject.imageID],
                    gameObject.x,
                    gameObject.y,
                    gameObject.w,
                    gameObject.h,
                    gameObject.angle,
                    gameObject.absoluteOffset
                ];
            }
            else {
                
                others.push([
                    addAttributes(assets[gameObject.imageID] , gameObject.attribute),
                    gameObject.x, 
                    gameObject.y, 
                    gameObject.w,
                    gameObject.h, 
                    gameObject.angle, 
                    gameObject.absoluteOffset
                ])
            }
            
        }
    
    })


    let selfHealthbar = []; 
    let otherHealthbars = [];
    let selfShipObject = [];
    let otherShipObjects = {};

    socket.on('shipUpdate', (data) => {

        
        for (let key in data.updatePack) {
            
            const shipObj = data.updatePack[key];
            if (socket.id == key) {
                //console.log("x:", shipObj.x, "y:", shipObj.y);
                selfHealthbar = [
                    shipObj.health,
                    shipObj.present_health,
                    shipObj.shield,
                    shipObj.present_shield,
                    shipObj.x, 
                    shipObj.y 
                ]; 

                selfShipObject = [shipObj.x, shipObj.y];
                
            }
            else {
                otherHealthbars.push([
                    shipObj.health,
                    shipObj.present_health,
                    shipObj.shield,
                    shipObj.present_shield,
                    shipObj.x, 
                    shipObj.y,
                    shipObj.absoluteOffset
                ])

                otherShipObjects[shipObj.interaction.ID] = {
                    x: shipObj.x,
                    y: shipObj.y, 
                    absoluteOffset: shipObj.absoluteOffset,
                    coll_rad : shipObj.collusion_radius
                }


            }
            

        }

        
        
    })



    socket.on('offset', (data) => {
        CalculateOffset.updateOffset(data.x, data.y);
    })
    
    const rotatedDraw = (image, x, y, w, h, angle) => {
        if (!image) return;
        let x_origin = x; 
        let y_origin = y; 

        ctx.save()
    
        ctx.translate(x_origin, y_origin); 
        ctx.rotate(angle);// Radyan turunden olmali 
        ctx.drawImage(image, -w / 2, -h / 2 , w , h); 
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
            const [image, x, y, w, h, angle, absoluteOffset] = self;
            rotatedDraw(image, x, y, w, h, (angle + 90) * Math.PI / 180);
        }
        others.forEach((data) => {
            const [image, x, y, w, h, angle, absoluteOffset] = data;
            rotatedDraw(image, x + absoluteOffset.x - CalculateOffset.offsetX,
                y + absoluteOffset.y - CalculateOffset.offsetY, w, h, (angle + 90) * Math.PI / 180);
        })
    }

    const drawHealthBars = () => {
        const shieldbar_y_offset = 10;
        const present_health_bar = assets['present_health'];
        const healthbar_template = assets['health_mono'];
        const present_shield_bar = assets['present_shield']
        const shieldbar_template = assets['shield_mono'];
        let bar_widthMax = 96; 
        let bar_height = 6;
        if (selfHealthbar) { 
            const [health, present_health , shield , present_shield, x, y] = selfHealthbar;
            ctx.drawImage(healthbar_template, x, y  , bar_widthMax , bar_height);
            ctx.drawImage(shieldbar_template, x, y - shieldbar_y_offset , bar_widthMax , bar_height);

            let hp_width = 96 * (present_health / health);
            let shield_width = 96 * (present_shield / shield); 

            ctx.drawImage(present_health_bar, x, y , hp_width , bar_height); 
            ctx.drawImage(present_shield_bar, x, y - shieldbar_y_offset, shield_width , bar_height);
            



        }
        
        otherHealthbars.forEach((data) => {
            const [health, present_health, shield, present_shield, x, y, absoluteOffset] = data;
            let hp_width = 96 * (present_health / health);
            let shield_width = 96 * (present_shield / shield); 

            if (shield_width > 1) {
                ctx.drawImage(shieldbar_template, x + absoluteOffset.x - CalculateOffset.offsetX , y +absoluteOffset.y -CalculateOffset.offsetY -shieldbar_y_offset , bar_widthMax , bar_height);
                ctx.drawImage(present_shield_bar, x + absoluteOffset.x - CalculateOffset.offsetX , y +absoluteOffset.y -CalculateOffset.offsetY -shieldbar_y_offset , shield_width , bar_height);
                
            }

            if (hp_width > 1) {
                ctx.drawImage(healthbar_template,x + absoluteOffset.x - CalculateOffset.offsetX , y +absoluteOffset.y -CalculateOffset.offsetY, bar_widthMax , bar_height);
                ctx.drawImage(present_health_bar,x + absoluteOffset.x - CalculateOffset.offsetX , y +absoluteOffset.y -CalculateOffset.offsetY, hp_width , bar_height);
                
            }



        })

    }


    function animate(timeStamp) { 

        ctx.clearRect(0, 0, 960, 470);
        drawBackground();
        drawGameObjects();
        drawHealthBars();
        //ctx.drawImage(assets['present_health'], 300, 300);
        requestAnimationFrame(animate);
        self = []; 
        others = [];
        selfHealthbar = []; 
        otherHealthbars = [];
        
    }


    setInterval(requestAnimationFrame(animate), 40);
    
    
} )


