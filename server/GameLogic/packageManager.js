const { Ship } = require("./ship")

const gameObjectPackage = (obj , pack , id) => { 
    if (!obj.isTrash) {

        attributes = {
            isAttackable: obj.isClickable, 
            isCollectable: obj.isAttackable, 
            isClickable: obj.isClickable
        }; 

        pack[id] = {
            x: obj.x,
            y: obj.y,
            w: obj.w,
            h: obj.h,
            angle: obj.angle,
            imageID: obj.imageID,
            absoluteOffset: obj.absoluteOffset,
            attribute : attributes

        }

    } else if (pack[id]) delete pack[id];    
}

const shipPackage = (obj, pack , id) => {
    if (obj instanceof Ship && !obj.isTrash) {
        
        pack[id] = {
            health: obj.health,
            present_health : obj.present_health,
            shield: obj.shield, 
            present_shield: obj.present_shield,
            x: obj.x - obj.w/2, 
            y: obj.y - obj.h/2,
            absoluteOffset: obj.absoluteOffset, 
            collusion_radius : obj.coll_radius,
            interaction: {
                ID: obj.interactionID, 
                type: obj.interactionType
            }
        }
        
    }
}



module.exports = {

    gameObjectPackage, 
    shipPackage

}