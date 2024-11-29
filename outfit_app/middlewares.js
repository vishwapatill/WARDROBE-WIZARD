const WardrobeItem = require('./models/WardrobeItem');
const User = require('./models/User');
const fs= require('fs')
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
var morgan = require('morgan')
const ejsMate= require('ejs-mate')
const axios = require('axios');

const multer = require('multer');
const FormData = require('form-data');

const upload = multer({ dest:'./uploads' });
const connectionmongo=require('connect-mongodb-session')(session)

const wardrobeModel=require('./models/wardrobe');

const gen_embed=async (u)=>{
    const r=await axios.post('http://localhost:5000/get_embedding',{image_url:u},{headers:{'Content-Type': 'application/json'}})
    return r.data;
}

const CheckAuth=(req,res,next)=>{
    console.log("checking auth ")
    if(!req.session.isAuth){
        console.log("failed")
        res.render('go_to_login',{message:"Login Required"});
    }
    else{
        console.log("auth pass")
        next()
    } 
};
const get_wadrobe_items= async (req,res,next)=>{
    const x=await wardrobeModel.find({user_id:req.session.user_id});
    console.log(x)
    const t=[];
    const b=[];
    const s=[];
    for(let i of x[0].items){
        const m=await WardrobeItem.findOne({_id:i.toString() });
        if(m.main_category=='topware'){
            t.push(m)
        }
        else if(m.main_category=='bottomware'){
            b.push(m)
        }
        else if(m.main_category=='footware'){
            s.push(m)
        }
    }
    req.t=t;
    req.b=b;
    req.s=s;
   
    console.log("got witems")
    next();
}
const get_potential_items= async (req,res,next)=>{
    const pt= await WardrobeItem.find({user_uploaded:false,main_category:'topware'})
    const pb= await WardrobeItem.find({user_uploaded:false,main_category:'bottomware'})
    const ps= await WardrobeItem.find({user_uploaded:false,main_category:'footware'})
    req.pt=pt;
    req.pb=pb;
    req.ps=ps;
    next();
}

const uploadtoApi=async (req,res,next)=>{
    console.log(process.env.api_key)
    try{
        const formData = new FormData();
        formData.append('file', fs.createReadStream(`./uploads/${req.file.filename}`));
        formData.append('api_key', process.env.api_key);
        console.log(process.env.api_key)
        const response = await axios.post('https://api.imghippo.com/v1/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        req.image_url=response.data.data.view_url;
        next();
    }
    catch(e){
            console.log(e)
            res.send('some error occured')
    }     
}
const savetodb= async (req,res,next)=>{
    const main_cat=req.body.main_category;
    const sub_cat=req.body.sub_category;
    const item_desc=req.body.desc;
    const embed= await gen_embed(req.image_url);
    const x=new WardrobeItem({main_category:main_cat,sub_category:sub_cat ,desc:item_desc ,image:req.image_url,user_uploaded:true,resnet_embed:embed.embedding})
    await x.save();
    await wardrobeModel.findOneAndUpdate({user_id:req.session.user_id},{$push:{items:x._id}},{new:true});
    next();
}
const upload_buy_to_db=async (req,res,next)=>{
    const r=await axios.post('http://localhost:5000/get_embedding_local',{image_url:req.body.image},{headers:{'Content-Type': 'application/json'}})
    const x=new WardrobeItem({image:req.body.image,main_category:req.body.main_category,sub_category:req.body.sub_category,desc:req.body.desc,resnet_embed:r.data.embedding,user_uploaded:false});
    await x.save();
    next();
}

module.exports={
    CheckAuth,get_wadrobe_items,get_potential_items,upload_buy_to_db,uploadtoApi,savetodb
}