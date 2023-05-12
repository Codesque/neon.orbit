const { GameObjects } = require('./gameObjects.js');
const { Ship } = require('./ship.js'); 
const { Laser } = require('./laser.js');


class Player extends Ship{

    static list = {};

    static onConnect(socket , interactionID) { 
        Player.list[socket.id] = new Player(socket.id);
        Player.list[socket.id].interactionID = interactionID;
        Player.list[socket.id].interactionType = "Player";
        Player.list[socket.id].listenEvents(socket);
        
        
    } 

    static disconnectPlayer(socket) {

        try {
            
            if (Player.list) {
                const disPlayer = Player.list[socket.id];
                if( Player.list[socket.id] && Player.list[socket.id].hasOwnProperty('isTrash') )
                    Player.list[socket.id].isTrash = true; 
    
            }
        } catch (err) {
            console.log(err)
        }
         
        
    }

    static makeThePlayerDisconnectAgain(socket) {
        if (Player.list[socket.id]) {
            Player.list[socket.id].isTrash = true; 
            delete Player.list[socket.id];    
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
        this.username = '404';
        this.centerCamera = undefined;
        this.disconnect = undefined;

        this.d_T = 0;
        
        
        
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

        socket.on('OtherPlayerClicked', (data) => {
            console.log('I am working', Math.random());
            
                for (let key in Player.list) {
                    if (Player.list[key] != this && Player.list[key].interactionID == data.toWhom) {
                        this.channeledTarget = Player.list[key];
                        this.isChanneled = true;
                        if (data.command == "attack") this.isAttacking = true;
                    }
                }
            


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

    attack2Target() {
        if (this.isAttacking && this.channeledTarget && this.channeledTarget.isAttackable) {

            let origin_x = this.x;
            let target_x =  this.channeledTarget.x + this.channeledTarget.absoluteOffset.x;

            let origin_y = this.y;
            let target_y =  this.channeledTarget.y + this.channeledTarget.absoluteOffset.y;
            

            const dx = (target_x) - (origin_x) || 0;
            const dy = (target_y) - (origin_y) || 0;

            let distance = Math.hypot(dy, dx);
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;

            if (this.d_T > this.attackTimer) {
                let offsetX = this.absoluteOffset.x; 
                let offsetY = this.absoluteOffset.y;
                
                new Laser(origin_x, origin_y, target_x, target_y, {x : offsetX , y : offsetY}, (this.angle));
                this.d_T = 0;
            }
            else this.d_T += 5;
        
        }
    }

    channel2Target() {

        let tolerance = 5;
        
        if (this.isChanneled && this.channeledTarget) {
            
            const dx = (this.x + this.absoluteOffset.x) - (this.channeledTarget.x + this.channeledTarget.absoluteOffset.x) || 0;
            const dy = (this.y + this.absoluteOffset.y) - (this.channeledTarget.y + this.channeledTarget.absoluteOffset.y) || 0;

            let distance = Math.hypot(dy, dx);
            
            //setTimeout(()=>{console.log('distance:', distance, 'r:', this.attack_radius)} , 10000);
            if (distance > this.channeling_radius) {
                this.isChanneled = false; 
                this.channeledTarget = null;
            } else {
                const angle = Math.atan2(dy, dx) * 180 / Math.PI || 0;     
                this.angle = (180 + angle);  
            }
            
            



        }

    }


    update() {
        super.update();
        if (this.centerCamera) this.centerCamera();
        this.go2Destination();
        this.channel2Target();
        this.attack2Target();
    }


}

module.exports = {Player} 