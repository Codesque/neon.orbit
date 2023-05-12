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
        unique : [true , "Bu hesap adı başkası daha önce başkası tarafından alınmıştır. Lütfen yeniden deneyiniz."]
    },

    password: {
        type: String, 
        required: [true, "Lütfen şifrenizi giriniz"]
    },

    isOnline: {
        type: Boolean 
    }, 

    interactionID: {
        type: String, 
        unique: [true, "InteractionID başkası tarafından alınmıştır. Lütfen geliştiriciyle iletişime geçiniz"]
    }




},
// timeStamps 
{
    timestamp: true ,     
}


)

// olusturulan mongoose schemasindan bir model yaratip export ediyoruz.
module.exports = mongoose.model('Accounts', mongooseSchema);