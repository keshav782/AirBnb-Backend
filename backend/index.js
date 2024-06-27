const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require("./models/User.js");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Place = require("./models/Place.js");
const Booking = require("./models/Booking.js");

app.use('/uploads', express.static(__dirname +'/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }));
app.use(express.json())
app.use(cookieParser()); 

app.get("/test", (req, res) => {
        res.json("test ok")
})

const SecretKey = "456$%^FGHbng";
const bcryptSalt =  bcrypt.genSaltSync(10)

mongoose.connect("mongodb+srv://simpleearth20:08AzhNRPdPfkGA8d@cluster0.phfuyjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, //
}).then(() => console.log("DB connected"))
.catch(err => console.log("----",err))
app.post("/register", async(req, res) => {
    const {name,email,password} = req.body
    console.log("------");
    try{
        const userDoc= await User.create({
            name,
            email,
            password:bcrypt.hashSync(password,bcryptSalt)
        })
        res.status(200).json(userDoc)
    }
    catch(e){
        res.status(422).json(e)
    }
})

app.post("/login", async(req, res) => {
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(user){
        if(bcrypt.compareSync(password,user.password)){
            //logged in
            jwt.sign({
                email:user.email,
                id:user._id,
                // name:user.name
            },SecretKey,{},(err,token)=>{
                console.log("token created")
                if(err) throw err;
                res.cookie("token",token).status(200).json(user)}
            )}
        else
        {
            res.status(422).json("wrong credentials")
        }
    }
    else
    {
        res.status(401).json("User not found")
    }
    
})


app.get('/profile', async(req,res)=>{
    
    try{
        const {token} = req.cookies;
        if(token){
            jwt.verify(token,SecretKey,{}, async(err,userData)=>{
                if(err) throw err;
                const {name,email,_id} = await User.findById(userData.id)
                res.json({name,email,_id})
            })
        }
        else
        {
            res.status(401).json(null)
        }
        // res.json({token})
    }
    catch(e){
        console.log(e);
    }
    
    
})

app.post('/logout',(req,res)=>{
    res.cookie("token","").json(true)
})

app.post('/upload-by-link',async(req,res)=>{
    const {link} = req.body;
    console.log("102",link)
    const name = 'photo' + Date.now() + '.jpg'
    try{
        await imageDownloader.image({
            url:link,
            dest:__dirname+'/uploads/'+name,
        });
        res.json(name)
    }
    catch(err){
        console.log(err)
    }
    
})

const photosMiddleware = multer({dest:'uploads/'})
app.post('/upload', photosMiddleware.array('photos',100),async(req,res)=>{
            const uploadfiles=[];
            
        for(let i=0;i<req.files.length;i++){
            const {path,originalname} = req.files[i];
            const parts =originalname.split('.')
            const extension = parts[parts.length-1];
            const newPath = `${path}.${extension}`;
            
            fs.renameSync(path,newPath);    
            const normalizedPath = newPath.replace(/\\/g, '/');
            const modified = normalizedPath.substring('uploads/'.length);
            uploadfiles.push(modified);
            
        }
       
        res.json(uploadfiles);
})

app.post('/places',(req,res)=>{

    const {token} = req.cookies;
    try{
        jwt.verify(token,SecretKey,{}, async(err,userData)=>{
            if(err) throw err;
            const PlaceDoc=await Place.create({
                owner:userData.id,
                title:req.body.title,
                address:req.body.address,
                photos:req.body.addedPhotos,
                description:req.body.description,
                perks:req.body.perks,
                extraInfo:req.body.extraInfo,
                checkin:req.body.checkIn,
                checkout:req.body.checkOut,
                maxGuests:req.body.maxGuests,
                price:req.body.price

            })
            res.status(200).json(PlaceDoc)
            
        })
    }
    catch(err)
    {
        console.log(err)
    }
   
})

app.get('/places',async(req,res)=>{
    const {token} = req.cookies;
    // console.log("123",token);
    try{
        jwt.verify(token,SecretKey,{}, async(err,userData)=>{
            const {id} = userData;
            res.json(await Place.find({owner:id}))
        })
    }
    catch(err)
    {
        console.log(err);
        res.status(401).json(null); 
    }
    
})

app.get('/places/:id',async(req,res)=>{
    
    const {id} = req.params;
    try{
        res.status(200).json(await Place.findById(id)) 
    }
    catch(err)
    {
        console.log(err);
        res.status(401).json(null); 
    }
})

app.put('/places',async(req,res)=>{
    const {id} = req.body;
    const {token} = req.cookies;
    //  console.log("123",id);
    try{
        jwt.verify(token,SecretKey,{}, async(err,userData)=>{
            if(err) throw err;
    
            const doc = await Place.findById(id);
            // console.log("doc",doc);
            if(userData.id === doc.owner.toString()){
                    doc.set({
                        title:req.body.title,
                        address:req.body.address,
                        photos:req.body.addedPhotos,
                        description:req.body.description,
                        perks:req.body.perks,
                        extraInfo:req.body.extraInfo,
                        checkin:req.body.checkIn,
                        checkout:req.body.checkOut,
                        maxGuests:req.body.maxGuests,
                        price:req.body.price
                    })
                await doc.save();
                res.status(200).json(doc)
            } 
        })
    }
    catch(err){
        console.log(err);
        res.status(401).json(null);
    }
    

})

app.get('/posts',async (req,res)=>{
    try{
        res.status(200).json(await Place.find());
    }
    catch(err){
        console.log(err)
    }
    
});

app.post('/booking',async(req,res)=>{
    const {token} = req.cookies;
    const {
        place,checkin,checkout,name,number,price
    } = req.body;
    try{

    }
    catch(err){
        console.error("Error creating booking:", err);
        res.status(400).json({ message: false, error: err.message });
    }
    jwt.verify(token,SecretKey,{}, async(err,userData)=>{
        if(err) throw err;
        const bookingDoc = await Booking.create({
            place,
            user:userData.id,
            checkin,
            checkout,
            name,
            number,
            price
        });
        res.status(200).json({ message: true, doc: bookingDoc });
            
    })
})

app.get('/booking',async(req,res)=>{
    const {token} = req.cookies;
    try{
        jwt.verify(token,SecretKey,{}, async(err,userData)=>{
            if(err) throw err;
                res.status(200).json(await Booking.find({user:userData.id}).populate("place"));
        })
    }
    catch(err){
        console.log(err);
    }
   
})

app.listen(5000, () => {
    console.log("Backend server is running")
})