const { GameObjects } = require('./gameObjects.js'); 

class Ship extends GameObjects{

    
    constructor() { 
        super(480 , 235); 
        this.w = 128; 
        this.h = 128; 

        this.speed = 30;
        this.rotationSpeed = 0.1;
        this.coll_radius = 20;
        this.channeling_radius = 1000;
        this.attack_radius = 600;

        this.imageID = 'ship0';
        this.interactionID = Math.random();
        this.interactionType = "Bot"; // default


        this.health = 1000; 
        this.present_health = 1000; 
        this.shield = 1000;
        this.present_shield = 1000;
        this.attackDamage = 100;
        this.attackTimer = 1000 * 0.5;
        this.regenerationRate = 10;
        this.isAttacking = false; 
        this.isChanneled = false; 
        this.isMining = false;
        this.isArrived = false;
        this.isDestroyed = false; 
        this.channeledTarget = null;

        this.isAttackable = true;
        this.isCollectable = false;
        this.isTargetable = true;
        

    }



    // Buradaki update methodu birnevi GameObject'teki update methodunu override eder : !! Polymorfizm !!
    check4_destruction() {
        if (this.present_health < 0) this.isDestroyed = true;
    }

    update() {
        super.update();
        this.check4_destruction();
    }
 




}

module.exports = { Ship };