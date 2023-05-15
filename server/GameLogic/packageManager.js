const { Collectable } = require("./collectableObjects");
const { Ship } = require("./ship")

const gameObjectPackage = (obj , pack , id) => { 
    if (!obj.isTrash) {

        pack[id] = {
            x: obj.x,
            y: obj.y,
            w: obj.w,
            h: obj.h,
            angle: obj.angle,
            imageID: obj.imageID,
            absoluteOffset: obj.absoluteOffset,

        }

    } //else if (pack[id]) delete pack[id];    
}

const shipPackage = (obj, pack , id) => {
    if (obj instanceof Ship && !obj.isTrash) {
        
        pack[id] = {
            health: obj.health,
            present_health : obj.present_health,
            shield: obj.shield, 
            present_shield: obj.present_shield,
            x: obj.x, 
            y: obj.y,
            absoluteOffset: obj.absoluteOffset, 
            collusion_radius : obj.coll_radius,
            interaction: {
                ID: obj.interactionID, 
                type: obj.interactionType
            },
            w: obj.w, 
            h: obj.h 
        }
        
    }
}

const collectablePackage = (obj, pack, iad) => {
    if (obj instanceof Collectable) {
        
        pack[iad] = {
            x: obj.x, 
            y: obj.y,
            absoluteOffset: obj.absoluteOffset,
            w: obj.w,
            h: obj.h,
            coll_r: obj.coll_r,
        }

    }
}



module.exports = {

    gameObjectPackage, 
    shipPackage,
    collectablePackage

}