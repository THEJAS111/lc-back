const express =require('express');
const app=express();
require('dotenv').config();
const main=require('./config/db');
const cookieparser=require('cookie-parser');
const authrouter=require('./routes/userauth');
const redisclient = require('./config/redis');
const problemrouter=require('./routes/problemcreator');
const submitrouter=require('./routes/submit');
const cors=require('cors');
const aiRouter=require('./routes/aichatting');

app.use(
  cors({
    origin: [
      "http://localhost:5173",              // local dev
      "https://lc-front-qbse.vercel.app",   // old frontend (if still active)
      "https://lc-front-mauve.vercel.app",  // your new frontend
      "https://lc-front-asdo.vercel.app",
      "https://lc-front-rkpp.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);



app.use(express.json());
app.use(cookieparser());

 
app.use('/user',authrouter)
app.use('/problem',problemrouter)
app.use('/submission',submitrouter);
app.use('/ai',aiRouter);

const initalizeconnection=async()=>{
    try{
        await Promise.all([main(),redisclient.connect()]);
        console.log("DB connected")
        app.listen(process.env.PORT,()=>{
    console.log("listening in port "+process.env.PORT);
    })
        
    }
    catch(err){
        console.log("error occured"+err);
    }
}
initalizeconnection();


