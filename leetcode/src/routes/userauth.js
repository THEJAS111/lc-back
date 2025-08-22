const express=require('express');
const {register,login,logout,adminregister,deleteprofile}=require('../controllers/userauthen');
const usermiddleware=require('../middleware/usermiddleware');
const adminmiddleware=require('../middleware/adminmiddleware');
const user = require('../models/user');

const  authrouter=express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',usermiddleware,logout);
authrouter.post('/admin/register',adminmiddleware,adminregister);
authrouter.delete('/profile',usermiddleware,deleteprofile)
authrouter.get('/check',usermiddleware,(req,res)=>{
    const reply={
        firstname:req.result.firstname,
        emailid:req.result.emailid,
        _id:req.result._id,
        role:req.result.role
    }
    res.status(200).json({
        user:reply,
        message:"valid user"
    }); 
})

module.exports=authrouter;
