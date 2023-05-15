const mongoose = require('mongoose'); 

//MongoDB nosql turunde bir veri tabani oldugundan bazi kavramlarin adlari farkli :
    // SQL veritabaninda recordlardan olusan butune Table denirken NoSQL'de collection denir. 
    // SQL veritabaninda record dedigimiz seyin NoSQL'deki karsiligi document'tir. 
    
// Burada aslinda schemalardan model ureterek 'Accounts' isimli bir collection olusturuyoruz. 
// Her oyuncunun bilgisi bir document olarak databasede tutulur. 
    

    
const mongooseSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Lütfen kullanıcı adınızı giriniz"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Lütfen şifrenizi giriniz."]
    },
    interactionID: {
        type: String,
        unique: true
    },
    currency: {
        neonthereum: {
            type: Number,
            default: 0
        }
    },
    hangar: {
        weaponary: [{ item: { type: Number } }],
        inventory: [{ item: { type: Number } }],
        currentShip: { type: String },
        ownedShips: [{
            ownedShip: {
                name: String,
                attack_damage: Number,
                attack_speed: Number,
                channeling_radius: Number,
                attack_radius: Number,
                health: Number,
                shield: Number,
                regeneration_rate: Number
            }
        }]
    }
},
    {
        timestamps: true
    }
);

// olusturulan mongoose schemasindan bir model yaratip export ediyoruz.
module.exports = mongoose.model('Accounts', mongooseSchema);