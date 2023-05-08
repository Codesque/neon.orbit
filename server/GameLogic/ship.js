const { GameObjects } = require('./gameObjects.js'); 

class Ship extends GameObjects{

    
    constructor() { 
        super(480 , 235); 
        this.w = 128; 
        this.h = 128; 
        this.spriteX = this.x + this.w / 2; 
        this.spriteY = this.y + this.h / 2;

        this.speed = 10;
        this.imageID = 'ship0';


        this.health = 1000; 
        this.isAttacking = false; 
        this.isChanneled = false; 
        this.isDestroyed = false; 

    }

    dragSprite() {
        this.spriteX = this.x; 
        this.spriteY = this.y;
    }

    // Buradaki update methodu birnevi GameObject'teki update methodunu override eder : !! Polymorfizm !!
    update() {
        super.update();
        this.dragSprite();
    }




}

module.exports = { Ship };