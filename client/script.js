import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { CalculateOffset } from "./js/calculateOffset.js";

const socket = io(); 


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



const events = () => {
    
    window.addEventListener('mousedown', (e) => {
        if(e.offsetX < canvas.width && e.offsetY < canvas.height)
        socket.emit("MapClicked", { x: e.offsetX, y: e.offsetY , c_width:canvas.width , c_height:canvas.height});
    })



}




events();

let gameObjectsData = [];
let clientOrder = null;
socket.on('update', (data) => { 
    data.updatePack.forEach(gameObject => {
        if (!assets) return;
        let image = assets[gameObject.imageID];
        gameObjectsData.push([
            image,
            gameObject.x,
            gameObject.y,
            gameObject.w,
            gameObject.h,
            gameObject.angle,
            gameObject.absoluteOffset
        ]);
        clientOrder = data.order;
    })
    
})




socket.on('offset', (data) => {
    CalculateOffset.updateOffset(data.x, data.y);
})
  
const rotatedDraw = (image, x, y , w , h , angle) => {
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
    image.style.width = "1526"; 
    image.style.height = "1014";
    ctx.drawImage(image,-CalculateOffset.offsetX, -CalculateOffset.offsetY , 1526 , 1014);
}


function animate(timeStamp) { 

    ctx.clearRect(0, 0, 960, 470);
    drawBackground();
    gameObjectsData.forEach(data => {
        const [image, x, y, w, h, angle, absoluteOffset] = data;

        if (data == gameObjectsData[clientOrder]) {
            //rotatedDraw(data[0], data[1], data[2], data[3], data[4], (data[5] + 90) * Math.PI / 180); 
            rotatedDraw(image, x, y, w, h, (angle + 90) * Math.PI / 180);
        }
            
        else
            rotatedDraw(image, x + absoluteOffset.x - CalculateOffset.offsetX,
                y + absoluteOffset.y - CalculateOffset.offsetY, w, h, (angle + 90) * Math.PI / 180);
                    
    }); 

    gameObjectsData = []; 
    requestAnimationFrame(animate);
    
}


setInterval(requestAnimationFrame(animate), 40);


