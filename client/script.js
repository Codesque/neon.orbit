import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { CalculateOffset } from "./js/calculateOffset.js";

const socket = io(); 


let canvas = document.getElementById('gameCanvas'); 
canvas.width = 960; 
canvas.height = 470;
let ctx = canvas.getContext('2d'); 

const events = () => {
    
    window.addEventListener('mousedown', (e) => {
        if(e.offsetX < canvas.width && e.offsetY < canvas.height)
        socket.emit("MapClicked", { x: e.offsetX, y: e.offsetY , c_width:canvas.width , c_height:canvas.height});
    })



}




events();

let gameObjectsData = [];
socket.on('update', (data) => { 
    data.updatePack.forEach(gameObject => {
        if (!assets) return;
        let image = assets[gameObject.imageID];
        gameObjectsData.push([image, gameObject.x, gameObject.y, gameObject.w, gameObject.h , gameObject.angle]);
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
    ctx.drawImage(image, -w / 2, -h / 2, w, h); 
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


setInterval(() => {
    
    ctx.clearRect(0, 0, 960, 470);
    drawBackground();
    gameObjectsData.forEach(data => {
        let [image, x, y, w, h, angle] = data;  
        rotatedDraw(image,x , y , w, h, (angle+90) * Math.PI / 180);
    })

    gameObjectsData = []

    
} , 50)
