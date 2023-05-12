const { GameObjects } = require('./gameObjects.js'); 

class Ship extends GameObjects{

    
    constructor() { 
        super(480 , 235); 
        this.w = 128; 
        this.h = 128; 
        this.spriteX = this.x + this.w / 2; 
        this.spriteY = this.y + this.h / 2;

        this.speed = 10;
        this.rotationSpeed = 0.1;
        this.coll_radius = 20;
        this.channeling_radius = 1000;
        this.attack_radius = 600;

        this.imageID = 'ship0';
        this.interactionID = Math.random();
        this.interactionType = "Bot"; // default


        this.health = 1000; 
        this.present_health = 500; 
        this.shield = 1000;
        this.present_shield = 500;
        this.attackTimer = 1000 * 1;
        this.isAttacking = false; 
        this.isChanneled = false; 
        this.isDestroyed = false; 
        this.channeledTarget = null;

        this.isAttackable = true;
        this.isCollectable = false;
        this.isTargetable = true;

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