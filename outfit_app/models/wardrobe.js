const mongoose=require('mongoose');

const wardrobeSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    },
    items:[
        {
           type:mongoose.Schema.Types.ObjectId,
           ref:'wardrobeitems'
        }
    ]
})
module.exports=mongoose.model('wardrobe',wardrobeSchema);