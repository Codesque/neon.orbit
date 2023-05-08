
class GameObjects{

    static gameObjectGroup = [];

    constructor(x0 = 0, y0 = 0) {
        this.x = x0; 
        this.y = y0;  
        // Oyun Objesinin mutlak hizi
        this.speed = 0; 
        this.vx = 0; 
        this.vy = 0;
        

        // Oyun objesini cizmek icin gerekli propertyler
        this.imageID = null;
        this.w = null; 
        this.h = null;
        this.angle = 0;
        /*
        this.collR = null; 
        this.collX = this.x; 
        this.collY = this.y;
        */


        this.clickable = true; 
        this.selected = false; 
        this.isMoving = false;
        

        GameObjects.gameObjectGroup.push(this);
    }

    

    update() {
        this.x += this.vx; 
        this.y += this.vy;
        
        // Neden + degil de - ?
            // Cunku ekranin sol yukari kosesi 0,0'ken ekranin sag alt kosesi 960,474 
            // Yani yukari gittikce y degeri azalmali 
            // Asagi gittikce y degeri artmali
            
            // Bu sisteme gore oyuncunun y eksenindeki hizi 0'dan buyuk oldugunda yukari gidecek. 
    }



}

module.exports = { GameObjects };