const redisclient = require("../config/redis");
const User =require("../models/user")
const validate=require("../utils/validator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const submission=require("../models/submission");



const register = async (req, res) => {
  try {
    // If this throws, it will be caught in catch
    validate(req.body);

    const { firstname, emailid, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const fin = await User.findOne({ emailid }); 
    if (fin) {
      return res.status(400).json({ error: "Email id already exists" });
    }

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailid: emailid, role: "user" },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });

    const reply = {
      firstname: user.firstname,
      emailid: user.emailid,
      _id: user._id,
      role: user.role,
    };

    res.status(200).json({
      user: reply,
      message: "logged in successfully",
    });
  } catch (err) {
  
    if (err.details) {
     
      return res.status(400).json({ error: err.details[0].message });
    }
    if (err.errors) {
      
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }

   
    res.status(400).json({ error: err.message || "Unknown error" });
  }
};

const login = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    // Validate input
    if (!emailid || !emailid.trim()) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Please enter a valid password" });
    }

    // Check if user exists
    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(401).json({ error: "Email id does not exist " });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Prepare user data for frontend
    const reply = {
      firstname: user.firstname,
      emailid: user.emailid,
      _id: user._id,
      role: user.role,
    };

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, emailid: user.emailid, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    // Set cookie
    res.cookie("token", token, { maxAge: 60 * 60 * 1000, httpOnly: true });

    // Send success
    res.status(200).json({
      user: reply,
      message: "Logged in successfully",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

const logout=async(req,res)=>{
    try{
           const {token}=req.cookies;
           const payload=jwt.decode(token);

           await redisclient.set(`token:${token}`,'blocked');
           await redisclient.expireAt(`token:${token}`,payload.exp);

           res.cookie("token",null,{expires:new Date(Date.now())});
           res.send("logged out succesfully ");
    }
    catch(err){
         res.status(503).send("error"+err);
    }
}

const adminregister=async(req,res)=>{
    try{
        validate(req.body);
        const {firstname,emailid,password}=req.body;
        req.body.password=await bcrypt.hash(password,10);
       

        const user=await User.create(req.body);

        const token = jwt.sign(
          { _id: user._id, emailid: emailid, role: req.body.role },
          process.env.JWT_KEY,
          { expiresIn: 60 * 60 }
        );
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("user registered succesfully ");

    }
    catch(err){
            res.status(401).send("Error:"+err );
    }
    
}

const deleteprofile=async(req,res)=>{
    try{
          const userid=req.result._id;
          await User.findByIdAndDelete(userid);
          await submission.deleteMany({userid});

          res.status(200).send("deleted succesfully ");

    }
    catch(err){
              res.status(404).send("some error has occurrd while deleteting "+err);
    }
}
module.exports={register,login,logout,adminregister,deleteprofile};