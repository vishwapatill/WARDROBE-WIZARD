const mongoose=require('mongoose')

const feedbackSchema=new mongoose.Schema(
    {
        top: {
                type: String,
                required:true
            }
            ,
        bottom: {
                type: String,
                required:true
            },
        shoe:{
                type: String,
                required:true
            },
        user_Id:{
            type:mongoose.Schema.Types.ObjectId 
        },
        score:{
            type: Number,
            required:true
        }

    }
)
module.exports=mongoose.model('feedback',feedbackSchema);