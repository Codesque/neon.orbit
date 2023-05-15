const { GameObjects } = require('./gameObjects.js');

class Laser extends GameObjects{


    constructor(src_x , src_y  , target , absoluteOffset , angle = 0 , damage = 100) {
        super(src_x, src_y); 
        this.speed = 30; 
        this.imageID = "laser_pink"; 
        this.absoluteOffset = absoluteOffset;
        this.w = 5; 
        this.h = 60; 
        this.angle = angle; 
        this.damage = damage;
        this.target = target;
        this.vir_id = Math.random();
        this.laserLifetime = 1000 * 2;
        this.d_T = 0;
    }

    go2destination() {
        let dy = (this.target.absoluteOffset.y + this.target.y - this.target.h/2) - (this.absoluteOffset.y + this.y ) || 0; 
        let dx = (this.target.absoluteOffset.x +this.target.x - this.target.w/2) - (this.absoluteOffset.x + this.x ) || 0; 

        const distance = Math.hypot(dy, dx); 
        
        
        

        if (distance > 50 || this.d_T < this.laserLifetime) { 
            let x = this.x; 
            let y = this.y;
            this.vy = this.speed * Math.sin(this.angle * Math.PI / 180) || 0;
            this.vx = this.speed * Math.cos(this.angle * Math.PI / 180) || 0; 
            this.d_T += 5;
            //this.absoluteOffset.x += (x - this.x); 
            //this.absoluteOffset.y += (y - this.y);
        }
        else {  
            
            this.vx = 0; 
            this.vy = 0;
            this.d_T = 0;
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