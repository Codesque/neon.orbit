const { GameObjects } = require('./gameObjects.js');
const { Collectable } = require('./collectableObjects.js')
const Accounts = require('../Models/registrationModel.js'); 
const bcrypt = require('bcrypt');
const { Ship } = require('./ship.js'); 
const { Laser } = require('./laser.js');


class Player extends Ship{

    static list = {};

    static saveToDB = async (socket, collectableObj) => {
        
        const user = await Accounts.findOne({ interactionID: Player.list[socket.id].interactionID });
        const iad = collectableObj.interactionID; 
        const amountData = `${collectableObj.amountOf}`;
        if (!iad || !amountData) return;
        if (user &&  bcrypt.compare( iad , amountData  )) {
            user.currency.neonthereum += collectableObj.amountOf;
            await user.save();
        }
        else console.log("Couldnt find the user with the interactionID", interactionID);
        

    }

    static onConnect(socket , interactionID) { 
        Player.list[socket.id] = new Player(socket.id);
        Player.list[socket.id].interactionID = interactionID;
        Player.list[socket.id].interactionType = "Player";
        Player.list[socket.id].listenEvents(socket);
        
        
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
        this.offsetX = Math.random() * 1000; 
        this.offsetY = Math.random() * 1000;
        this.absoluteOffset = {
            x: 0, 
            y: 0
        }
        this.username = '404';
        this.centerCamera = undefined;
        this.disconnect = undefined;
        this.miningProtocole = undefined;
        this.check4_destruction = undefined;


        this.d_T = 0;
        
        
        
        
    }





    listenEvents(socket) {
        socket.on('MapClicked', (data) => { 
            this.isMining = false;

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
            //console.log('I am working', Math.random());
            
                for (let key in Player.list) {
                    if (Player.list[key] != this && Player.list[key].interactionID == data.toWhom) {
                        this.channeledTarget = Player.list[key];
                        this.isChanneled = true;
                        if (data.command == "attack") this.isAttacking = true;
                    }
                }
            


        })

        socket.on('MiningProtocol', (data) => { 

            if (Collectable.list[data.which] && !Collectable.list[data.which].isTrash) {
                
                let x = Collectable.list[data.which].x + Collectable.list[data.which].absoluteOffset.x ;
                let y = Collectable.list[data.which].y + Collectable.list[data.which].absoluteOffset.y  - 100;
    
                this.miningProtocole = () => {
    
                    if (!this.isArrived) {
                        
                        this.destinationCords = {
                            x: x - this.absoluteOffset.x,
                            y: y - this.absoluteOffset.y
                        }
                        this.isMoving = true;
    
    
                    } else {
                        Collectable.list[data.which].collect(this.isMoving);
                        if (Collectable.list[data.which].isCollected) {
                            Player.saveToDB(socket, Collectable.list[data.which]);
                            this.miningProtocole = undefined;
                        }else if(this.isMoving) this.miningProtocole = undefined;
                    }
    
                }



            }

            
        })

        Player.list[socket.id].check4_destruction = ()=>  {
            if ( socket && Player.list[socket.id] && Player.list[socket.id].isDestroyed) {
                Player.list[socket.id].vx = 0; 
                Player.list[socket.id].vy = 0; 
                Player.list[socket.id].speed = 0;
                socket.emit('PlayerDestroyed', { success: true }); 


                
            }
        }
        
    } 


    go2Destination(destination = this.destinationCords) {
        this.isArrived = false;
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
                this.isArrived = true;
            }
        

        }

    }

    dealDamagePVP(damage) {

        if (this.channeledTarget.present_shield > 0) this.channeledTarget.present_shield -= damage;
        else if (this.channeledTarget.present_health > 0) this.channeledTarget.present_health -= damage;
        else {
            this.channeledTarget.isDestroyed = true;
            this.channeledTarget.isAttackable = false;
            this.channeledTarget = null; 
            this.isChanneled = false; 
            this.isAttacking = false;
            
        } 
        
    }
    attack2Target() {
        if (this.isAttacking && this.channeledTarget && this.channeledTarget.isAttackable) {

            let origin_x = this.x ;
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
                let laserInterval = 40;

                
                new Laser(origin_x - laserInterval  , origin_y  ,this.channeledTarget, {x : offsetX , y : offsetY}, (this.angle));
                new Laser(origin_x + laserInterval, origin_y, this.channeledTarget, { x: offsetX, y: offsetY }, (this.angle));
                this.dealDamagePVP(this.attackDamage);
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
            
            if (distance > this.channeling_radius) {
                this.isChanneled = false; 
                this.channeledTarget = null;
            } else {

                if (distance > this.attack_radius) this.isAttacking = false;

                const angle = Math.atan2(dy, dx) * 180 / Math.PI || 0;     
                this.angle = (180 + angle);  
            }
            
            



        }

    }




    update() {
        super.update();
        if (this.centerCamera) this.centerCamera();
        if (this.miningProtocole) this.miningProtocole();
        this.go2Destination();
        this.channel2Target();
        this.attack2Target();
        if (this.check4_destruction) this.check4_destruction();
    }


}

module.exports = {Player} 