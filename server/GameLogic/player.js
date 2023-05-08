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
        
        
        
    }

    listenEvents(socket) {
        socket.on('MapClicked', (data) => { 

            this.destinationCords.x = data.x; 
            this.destinationCords.y = data.y;
            this.isMoving = true;

        })
        
    } 


    go2Destination(destination = this.destinationCords) {

        if (this.isMoving) {
            
            let dy = destination.y - this.y ; 
            let dx = destination.x - this.x ; 
    
            const distance = Math.hypot(dy, dx); 
            this.angle = Math.atan2(dy, dx) * 180 / Math.PI; 
    
            if (distance > 100) {
                this.vy = this.speed * (dy / distance) || 0;
                this.vx = this.speed * (dx / distance) || 0; 
            }
            else {
                this.vx = 0; 
                this.vy = 0;
                this.isMoving = false;
            }

        }

    }


    update() {
        super.update();
        this.go2Destination()
    }


}

module.exports = {Player} 