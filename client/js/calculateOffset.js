class CalculateOffset{

    static offsetX = 0; 
    static offsetY = 0; 



    static updateOffset(newOffsetX, newOffsetY) {


        if (newOffsetX && newOffsetY) {
            
            this.offsetX += newOffsetX; 
            this.offsetY += newOffsetY;

            
        }
        
    }

}

export { CalculateOffset };