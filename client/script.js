import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";

const socket = io(); 

let canvas = document.getElementById('gameCanvas'); 
canvas.width = 960; 
canvas.height = 470;
let ctx = canvas.getContext('2d'); 

const events = () => {
    
    window.addEventListener('mousedown', (e) => {
        if(e.offsetX < canvas.width && e.offsetY < canvas.height)
        socket.emit("MapClicked", { x: e.offsetX, y: e.offsetY });
    })



}
events();

let gameObjectsData = [];
socket.on('update', (data) => { 
    data.updatePack.forEach(gameObject => {
        let image = document.getElementById(gameObject.imageID); 
        gameObjectsData.push([image, gameObject.x, gameObject.y, gameObject.w, gameObject.h , gameObject.angle]);
    })
    
})

function rotateAndPaintImage ( context, image, angleInRad , positionX, positionY, axisX, axisY ) {
    context.translate( positionX, positionY );
    context.rotate( angleInRad );
    context.drawImage( image, -axisX, -axisY );
    context.rotate( -angleInRad );
    context.translate( -positionX, -positionY );
}
  
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

setInterval(() => {
    
    ctx.clearRect(0, 0, 960, 470);
    gameObjectsData.forEach(data => {
        let [image, x, y, w, h, angle] = data;  
        rotatedDraw(image,x , y , w, h, (angle+90) * Math.PI / 180);
    })

    gameObjectsData = []

    
} , 50)
