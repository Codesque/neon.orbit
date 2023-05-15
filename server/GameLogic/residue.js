const { Collectable } = require('./collectableObjects.js'); 
const {Player} = require('../GameLogic/player.js');
const Accounts = require('../Models/registrationModel.js');

class Residue extends Collectable{

    static lostAll = async (socket) => {

        const user = await Accounts.findOne({ interactionID: Player.list[socket.id].interactionID }); 
        if (user) {
            const amount = user.currency.neonthereum;
            new Residue(amount); 
            user.currency.neonthereum = 0;
        }
        
    }


    constructor(amount) {
        super(amount);
    }


}