const mongoose = require('mongoose');

const WardrobeItemSchema = new mongoose.Schema({
    image: {
        type: String, 
        required: true
    },
    main_category:{
        type:String,
        required:true
    },
    sub_category:{
        type:String,
        required:true
    },
    desc: {
        type: String,
     },
     user_uploaded:{
        type:Boolean,
        required:true,
        default:true
     },
    resnet_embed:{
        type: Array,
        required:true
    }
});

module.exports = mongoose.model('WardrobeItem', WardrobeItemSchema);
