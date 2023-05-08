const {Ship}  = require('./ship.js'); 


class Player extends Ship{

    static onConnect(socket) { 
        const disPlayer = new Player(socket.id);
        disPlayer.listenEvents(socket);
    }

    
    constructor(id) {
        super();  
        this.id = id; 
        this.destinationCords = {
            x: undefined, 
            y: undefined
        }
        this.offsetX = 0; 
        this.offsetY = 0;
        this.centerCamera = undefined;
        
        
        
    }

    listenEvents(socket) {
        socket.on('MapClicked', (data) => { 

            this.destinationCords.x = data.x; 
            this.destinationCords.y = data.y;

            if ((data.c_width) && (data.c_height)) {
                this.cameraCenterX = data.c_width / 2; 
                this.cameraCenterY = data.c_height / 2;  
            } else {
                this.cameraCenterX = 480; 
                this.cameraCenterY = 235;
            }
            
            this.isMoving = true;


            const centerCamera = () => {
                this.offsetX = this.x - this.cameraCenterX; 
                this.offsetY = this.y - this.cameraCenterY; 
                this.x = this.cameraCenterX; 
                this.y = this.cameraCenterY; 
                
                if ((this.offsetX != 0 || this.offsetY != 0)&& (this.isMoving)) {
                    socket.emit('offset', { x: this.offsetX, y: this.offsetY });
                    this.destinationCords.x -= this.offsetX; 
                    this.destinationCords.y -= this.offsetY;
                   
                    
                }
                

                

            }

            this.centerCamera = centerCamera;


        })
        
    } 


    go2Destination(destination = this.destinationCords) {

        if (this.isMoving) {
            
            let dy = destination.y - this.y ; 
            let dx = destination.x - this.x ; 
    
            const distance = Math.hypot(dy, dx); 
            this.angle = Math.atan2(dy, dx) * 180 / Math.PI; 
            console.log(distance);
    
            if (distance > 20) { 
                this.vy = this.speed * (dy / distance) || 0;
                this.vx = this.speed * (dx / distance) || 0; 
            }
            else {
                this.isMoving = false;
                
                this.vx = 0; 
                this.vy = 0;
                this.offsetX = 0; 
                this.offsetY = 0;
            }
        

        }

    }




    update() {
        super.update();
        if (this.centerCamera) this.centerCamera();
        this.go2Destination();
    }


}

module.exports = {Player} 