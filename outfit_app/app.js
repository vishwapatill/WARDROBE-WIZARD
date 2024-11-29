require('dotenv').config('D:\\outfit_app\\.env');
var middlewares=require('./middlewares.js')
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
var morgan = require('morgan')
const ejsMate= require('ejs-mate')
const axios = require('axios');
const cros=require('cors')
const multer = require('multer');
const FormData = require('form-data');

const upload = multer({ dest:'./uploads' });
const connectionmongo=require('connect-mongodb-session')(session)

const WardrobeItem = require('./models/WardrobeItem');
const User = require('./models/User');

const wardrobeModel=require('./models/wardrobe');

const app = express();
app.use(cros());
const fs=require('fs');
const wardrobe = require('./models/wardrobe');
const methodOverride = require('method-override');
const feedback=require('./models/Feedback')



app.use(morgan('tiny'))
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

const store=new connectionmongo({
    uri:"mongodb://127.0.0.1:27017/wardrobe_wizard",
    collection:"session_ids"
})

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true ,store}));



mongoose.connect("mongodb://127.0.0.1:27017/wardrobe_wizard");
app.get('/login', (req, res) => {
    console.log(__dirname)
    if(req.session.isAuth){

        res.render('login',{isAuth:true,u:req.session.user_name});
    }
    else{
        res.render('login',{isAuth:false,u:"NUL"});
    }
});

app.post('/login', async (req, res) => {
    const {username,password }=req.body;
    const x=await User.findOne({username});
    if(!x){
        res.send('No user Found with the given username');
    }
    else{
        if(password!=x.password){
            res.send("wrong_password");
        }
        else{
            req.session.isAuth=true;
            req.session.user_id=x._id;
            req.session.user_name=x.username;
            res.redirect('/my_wardrobe')
        }   
    }
});
const gen_embed=async (u)=>{
        const r=await axios.post('http://localhost:5000/get_embedding',{image_url:u},{headers:{'Content-Type': 'application/json'}})
        return r.data;
}
app.get('/sign_up', (req, res) => {

    res.render('sign_up');
});

app.post('/recommendation/feedback',async(req,res)=>{
    const x= new feedback({top:req.body.t_id,bottom:req.body.b_id,shoe:req.body.f_id,score:req.body.score})
    await x.save()
    res.send("<div style='display:flex'> <div> <h1>Feedback Recorded ,Thankyou</h1></div></div> <a href='/'>Go back</a>")
})

app.post('/sign_up', async (req, res) => {
    const e=req.body.email;
    const x=await User.findOne({email:e});
    if(!x){
       
       const n=new User(req.body);
       await n.save();
       const x=new wardrobeModel({user_id:n._id});
       await x.save();
       res.redirect('/login');
    }
    else{
        res.render('go_to_login',{message:"User Already Exsits"});
    }
});
app.post('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/login');
})
app.get('/select_from_existing',(req,res)=>{
  res.render('select_existing',{tops_existing,bottoms_existing,shoes_existing})
})
app.get('/', (req, res) => {
    res.render('index');
})
app.get('/smart_buy',middlewares.CheckAuth,(req,res)=>{
    res.render('smart_buy')
})

app.get('/generate_buy', middlewares.CheckAuth, middlewares.get_wadrobe_items, middlewares.get_potential_items, async (req, res) => {
    console.log("request made")
    // Get the user and potential items from the request
    const user_items = {
        topware: req.t, // assuming `req.t` contains user topware items
        bottomware: req.b, // assuming `req.b` contains user bottomware items
        footware: req.s, // assuming `req.s` contains user footware items
    };
    
    const potential_items = {
        topware: req.pt, // assuming `req.pt` contains potential topware items
        bottomware: req.pb, // assuming `req.pb` contains potential bottomware items
        footware: req.ps, // assuming `req.ps` contains potential footware items
    };
    
    // Step 1: Generate the lists of item pairs from user_items
    const list1 = generateItemPairs(user_items.topware, user_items.bottomware);
    const list2 = generateItemPairs(user_items.topware, user_items.footware);
    const list3 = generateItemPairs(user_items.bottomware, user_items.footware);
    
    // Step 2: Calculate compatibility scores for each potential item and store averages
    const recommendations = {
        footware: [],
        bottomware: [],
        topware: []
    };

    // Calculate scores for footware potential items
    for (const footware of potential_items.footware) {
        let totalScore = 0;
        let count = 0;
        
        // For each pair in list1 (topware + bottomware)
        for (const [topware, bottomware] of list1) {
            const score = await calculateScore(topware, bottomware, footware);
            totalScore += score;
            count++;
        }
        
        recommendations.footware.push({
            footware: footware,
            average_score: totalScore / count,
            image:footware.image
        });
    }

    // Calculate scores for bottomware potential items
    for (const bottomware of potential_items.bottomware) {
        let totalScore = 0;
        let count = 0;
        
        // For each pair in list2 (topware + footware)
        for (const [topware, footware] of list2) {
            const score = await calculateScore(topware, bottomware, footware);
            totalScore += score;
            count++;
        }
        
        recommendations.bottomware.push({
            bottomware: bottomware,
            average_score: totalScore / count,
            image:bottomware.image
        });
    }

    // Calculate scores for topware potential items
    for (const topware of potential_items.topware) {
        let totalScore = 0;
        let count = 0;
        
        // For each pair in list3 (bottomware + footware)
        for (const [bottomware, footware] of list3) {
            const score = await calculateScore(topware, bottomware, footware);
            totalScore += score;
            count++;
        }
        
        recommendations.topware.push({
            topware: topware,
            average_score: totalScore / count,
            image:topware.image
        });
    }

    // Step 3: Sort each category by average score and take the top 4 items
    recommendations.footware.sort((a, b) => b.average_score - a.average_score);
    recommendations.bottomware.sort((a, b) => b.average_score - a.average_score);
    recommendations.topware.sort((a, b) => b.average_score - a.average_score);

    recommendations.footware = recommendations.footware.slice(0, 4);
    recommendations.bottomware = recommendations.bottomware.slice(0, 4);
    recommendations.topware = recommendations.topware.slice(0, 4);

    // Step 4: Send he recommendations as a response
    const all_recommendations={
        recommended_footware: recommendations.footware,
        recommended_bottomware: recommendations.bottomware,
        recommended_topware: recommendations.topware
    }
   res.render('generated',{all_recommendations})
});

// Helper function to generate all pairs of items
function generateItemPairs(arr1, arr2) {
    let pairs = [];
    for (let item1 of arr1) {
        for (let item2 of arr2) {
            pairs.push([item1, item2]);
        }
    }
    return pairs;
}

// Function to calculate score (you can replace this with your actual calculation logic)
async function calculateScore(topware, bottomware, footware) {
    // Call to external API or your internal logic to calculate score
    // This is just a placeholder, you would replace this with your actual logic
    const response = await axios.post('http://localhost:5000/calculate_score', {
        top_emb: topware.resnet_embed,
        bottom_emb: bottomware.resnet_embed,
        shoes_emb: footware.resnet_embed
    });

    return response.data.compatibility_score;
}


app.get('/my_wardrobe',middlewares.CheckAuth,middlewares.get_wadrobe_items, async (req, res) => {
        res.render('my_wardrobe', {topware:req.t,bottomware:req.b,footware:req.s});
})
app.get('/my_wardrobe/upload', (req, res) => {
    if(!req.session.isAuth){
        res.render('go_to_login',{message:"Login Required"});
    }
    else{
        res.render('upload');
    }
});

app.delete('/wardrobe_item/delete/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      const deletedItem = await WardrobeItem.findByIdAndDelete(itemId);
      if (!deletedItem) {
        return res.status(404).send('Item not found');
      }
      console.log('deleted form  WardrobeItem')
      const deletedi=await wardrobeModel.updateOne({ items: itemId },{$pull: {items: itemId}} )
      if (!deletedi) {
        return res.status(404).send('Item not found 2');
      }
      res.redirect('/my_wardrobe');
    } 
      catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });


app.get('/api/upb',(req,res)=>{
   res.render('upload_buy')
})
app.post('/api/my_wardrobe/upload_buy',middlewares.upload_buy_to_db,(req,res)=>{
    res.send("Sucess");
})
app.post('/my_wardrobe/upload',upload.single('image'),middlewares.uploadtoApi,middlewares.savetodb,(req, res) => {
    res.redirect('/my_wardrobe');
});

app.get('/my_wardrobe/detail/:id', async (req, res) => {
    const item = await WardrobeItem.findById(req.params.id);
    res.render('wardrobe_detail', { item });
});
const make_Score_req=async (top_emb,bottom_emb,shoes_emb)=>{
    try {
        const response = await axios.post('http://localhost:5000/calculate_score', {
          top_emb,
          bottom_emb,
          shoes_emb
        });
        const compatibilityScore = response.data.compatibility_score;
        console.log(compatibilityScore)
        return compatibilityScore
      } catch (error) {
        console.error('Error fetching compatibility score:', error);
        return -1;
      }
}
const generate_all_outfits=async (t,b,s)=>{
    const combinations = [];
    for (let i = 0; i < t.length; i++) {
        for (let j = 0; j < b.length; j++) {
            for (let k = 0; k < s.length; k++) {
                const score=await make_Score_req(t[i].resnet_embed, b[j].resnet_embed, s[k].resnet_embed)
                console.log(score)
                combinations.push([t[i].image, b[j].image, s[k].image,score,t[i]._id,b[j]._id,s[k]._id]);
            }
        }
    }
    combinations.sort((a, b) => b[3] - a[3]); // Sort by the 4th element (score)
    const topCombinations = combinations.slice(0, 10);
    return topCombinations
}

app.get('/recommendations',middlewares.CheckAuth,middlewares.get_wadrobe_items, async(req, res) => {
    const all_outfits=await generate_all_outfits(req.t,req.b,req.s);
    res.render('recommendations', { recommendations: all_outfits }); // Pass recommendations as needed
});
app.get('/recommendation_details/:top_id/:bottom_id/:footware_id', async (req, res) => {
    const top_id = req.params.top_id;
    const bottom_id=req.params.bottom_id
    const footware_id=req.params.footware_id
    const a=await WardrobeItem.findById(top_id)
    const b=await WardrobeItem.findById(bottom_id)
    const c=await WardrobeItem.findById(footware_id)
    res.render('recommendation_details',{top_id, bottom_id, footware_id ,top:a.image,bottom:b.image,footware:c.image})

  });
app.listen(3000,()=>{
    console.log("server listening on http://127.0.0.1:3000")
});

