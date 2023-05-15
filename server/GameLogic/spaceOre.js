const { Collectable } = require('./collectableObjects.js');


class SpaceOre extends Collectable{

    constructor(amount) {

        super(amount);
        this.imageID = "space_ore"; 
        this.w = 32; 
        this.h = 32; 


    } 

    update() {
        super.update(); 
    }

    collect(isPlayerMoving) {
        super.collect(isPlayerMoving);
    }

}



module.exports = { SpaceOre };