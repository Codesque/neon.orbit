const { GameObjects } = require("./gameObjects");
const bcrypt = require('bcrypt');
const Accounts = require('../Models/registrationModel.js');

class Collectable extends GameObjects{

    static list = {};
    static clearTrash = () => {
        for (let key in Collectable.list)
            if (Collectable.list[key] && Collectable.list[key].isTrash ) delete Collectable.list[key];
    }

    static hashFunc = async (data) => {
        //console.log("data:",data)
        if (data) {
            const hash = await bcrypt.hash(`${data}`, 10);
            //console.log("hash:",hash);
            return hash;
        }
        //else throw Error('undefined amount');
    }
    
    /* 
    static saveToDB = async (socket , interactionID)=> {

        const user = await Accounts.findOne({ interactionID: Player.list[socket.id].interactionID });
        if (user) {
            user.currency.neonthereum += Collectable.list[interactionID].amountOf;
            await user.save();
        }
        else console.log("Couldnt find the user with the interactionID", interactionID);
    }
    */


    constructor(amount) {
        super();
        this.isCollectable = true;
        this.isCollected = false;
        this.isClickable = true; 
        this.isShrinking = false; 
        this.isRecyclableTrash = false;
        this.rotation_speed = Math.random() * 10 - 5;
        if (this.rotation_speed < 1 && this.rotation_speed > -1) this.rotation_speed = 3;
        
         
        
        this.amountOf = amount;   
        this.speed = 3;
        this.coll_r = 20;
        this.absoluteOffset = {
            x: 0, 
            y: 0,
        }

        this.d_T = 0;
        this.miningTime = 600 * 1;
        this.shrinkingSpeed = 0.05;
        this.isCollected = false;

        this.x = Math.random() * 3052; 
        this.y = Math.random() * 2028;
        this.assign_iad(amount);
    }

    assign_iad = async (amount) => {
        this.interactionID = await Collectable.hashFunc(amount);
        Collectable.list[this.interactionID] = this;
        //console.log('interactionID :' , this);
        
    }


    shrink() {
        this.isShrinking = true;
        this.w = Math.max(this.w * (1 - (this.d_T/this.miningTime)*this.shrinkingSpeed) , 1) 
        this.h = Math.max(this.h * (1 - (this.d_T / this.miningTime) * this.shrinkingSpeed), 1)
        this.vy = -0.5 + 0.5*Math.sin(this.angle); 
        this.vx = 5 * Math.cos(this.angle) ;
    }

    collect(isPlayerMoving) {
        
        if (!isPlayerMoving) {
            if (this.d_T > this.miningTime) {
                this.isCollected = true;
                this.isRecyclableTrash = true;
                
            } else {
                this.d_T += 5; 
                this.shrink();
            }
            
        }
        else {
            this.d_T = 0;
            this.isShrinking = false;
            
        }
    }

    respawn() {
        this.isCollectable = true;
        this.isCollected = false;
        this.isClickable = true; 
        this.isShrinking = false;
        this.rotation_speed = Math.random() * 10 - 5;
        if (this.rotation_speed < 1 && this.rotation_speed > -1) this.rotation_speed = 3;
        this.x = Math.random() * 3052;
        this.y = Math.random() * 2028;

        this.w = 32; 
        this.h = 32;
        this.vx = 0; 
        this.vy = 0;
        this.d_T = 0;

        this.isRecyclableTrash = false;
        
        
        
    }


    update() {
        super.update();
        this.angle += this.rotation_speed;
        if (this.isRecyclableTrash) this.respawn();
    }


}


module.exports = { Collectable };