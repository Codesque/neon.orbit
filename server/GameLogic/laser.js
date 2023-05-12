const { GameObjects } = require('./gameObjects.js');

class Laser extends GameObjects{


    constructor(src_x , src_y  , dest_x , dest_y , absoluteOffset , angle = 0 , damage = 100) {
        super(src_x, src_y); 
        this.speed = 30; 
        this.imageID = "laser_pink"; 
        this.absoluteOffset = absoluteOffset;
        this.w = 5; 
        this.h = 60; 
        this.angle = angle; 
        this.damage = damage;
        this.destination = {
            x: dest_x, 
            y: dest_y
        }
        this.vir_id = Math.random();
    }

    go2destination() {
        let dy = this.destination.y - (this.absoluteOffset.y + this.y) || 0; 
        let dx = this.destination.x - (this.absoluteOffset.x + this.x) || 0; 

        const distance = Math.hypot(dy, dx);
        
        
        

        if (distance > 50) { 
            let x = this.x; 
            let y = this.y;
            this.vy = this.speed * Math.sin(this.angle * Math.PI / 180) || 0;
            this.vx = this.speed * Math.cos(this.angle * Math.PI / 180) || 0; 
            //this.absoluteOffset.x += (x - this.x); 
            //this.absoluteOffset.y += (y - this.y);
        }
        else {  
            
            this.vx = 0; 
            this.vy = 0;
            this.isMoving = false;
            this.isTrash = true;
        }

    }


    update() {
        super.update();
        this.go2destination();
        
    }






}

module.exports = { Laser };