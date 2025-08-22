const express=require('express');
const problemrouter=express.Router();
const adminmiddleware=require("../middleware/adminmiddleware");
const {createproblem,updateproblem,deleteproblem,getproblembyid,getallproblem,solvedallproblembyuser,submittedproblem,submittedall}=require('../controllers/userproblem')
const usermiddleware=require('../middleware/usermiddleware');
//admin access
problemrouter.post("/create",adminmiddleware,createproblem);
problemrouter.put("/update/:id",adminmiddleware,updateproblem);
problemrouter.delete("/delete/:id",adminmiddleware,deleteproblem);

//user and admin access
problemrouter.get("/problembyid/:id",usermiddleware,getproblembyid);
problemrouter.get("/getallproblem",usermiddleware,getallproblem);
problemrouter.get("/problemsolvedbyuser",usermiddleware,solvedallproblembyuser);
problemrouter.get("/submittedproblem/:pid",usermiddleware,submittedproblem);
problemrouter.get("/submittedall",usermiddleware,submittedall);


module.exports=problemrouter;
