const { GameObjects } = require('./gameObjects.js');
const {Ship}  = require('./ship.js'); 


class Player extends Ship{

    static list = {};

    static onConnect(socket) { 
        const disPlayer = new Player(socket.id);
        disPlayer.listenEvents(socket);
        
        Player.list[socket.id] = this;
    } 

    static disconnectPlayer(socket) {

        if (Player.list) {
            const disPlayer = Player.list[socket.id];
            socket.emit('clearPlayer' , {absoluteOffset:disPlayer.absoluteOffset , w:disPlayer.w , h:disPlayer.h})
    
            if( Player.list[socket.id].hasOwnProperty('isTrash') )
                Player.list[socket.id].isTrash = true; 

        }
         
        
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
        this.absoluteOffset = {
            x: 0, 
            y: 0
        }
        this.centerCamera = undefined;
        this.disconnect = undefined;
        
        
        
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
                this.offsetX = this.x - this.cameraCenterX || 0; 
                this.offsetY = this.y - this.cameraCenterY || 0; 
                this.absoluteOffset.x += this.offsetX || 0; 
                this.absoluteOffset.y += this.offsetY || 0;
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
            
            let dy = destination.y - this.y || 0; 
            let dx = destination.x - this.x || 0; 
    
            const distance =
            (((dy) ** (2)) + ((dx) ** (2))) ** (1 / 2);
            this.angle = Math.atan2(dy, dx) * 180 / Math.PI || 0; 
            //console.log(distance);
    
            if (distance > 20) { 
                this.vy = this.speed * (dy / distance) || 0;
                this.vx = this.speed * (dx / distance) || 0; 
            }
            else {  
                
                this.vx = 0; 
                this.vy = 0;
                this.offsetX = 0; 
                this.offsetY = 0;
                this.isMoving = false;
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