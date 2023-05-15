
class GameObjects{

    static gameObjectGroup = [];

    static clearTrash = () => {
        for (let i = 0; i < GameObjects.gameObjectGroup.length; i++)
            if (GameObjects.gameObjectGroup[i] && GameObjects.gameObjectGroup[i].isTrash ) delete GameObjects.gameObjectGroup[i];
    }



    constructor(x0 = 0, y0 = 0) {
        this.x = x0; 
        this.y = y0;  
        // Oyun Objesinin mutlak hizi
        this.speed = 0; 
        this.vx = 0; 
        this.vy = 0;
        this.id = Math.random();

        this.absoluteOffset = 0;
        

        // Oyun objesini cizmek icin gerekli propertyler
        this.imageID = null;
        this.w = 128; 
        this.h = 128;
        this.maxW = 128; 
        this.maxH = 128;
        this.angle = 0;
        /*
        this.collR = null; 
        this.collX = this.x; 
        this.collY = this.y;
        */


        this.isClickable = true; 
        this.isAttackable = false;
        this.isCollectable = false;
        this.selected = false; 
        this.isMoving = false;
        this.isTrash = false;
        

        GameObjects.gameObjectGroup.push(this);
    }


    

    update() {
        this.x += this.vx; 
        this.y += this.vy;

        
    }



}

module.exports = { GameObjects };