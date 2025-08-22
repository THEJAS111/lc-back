const express=require('express');
const submitrouter=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const {submitcode,runcode}=require('../controllers/usersubmission');

submitrouter.post("/submit/:id",usermiddleware,submitcode);
submitrouter.post("/run/:id",usermiddleware,runcode);

module.exports=submitrouter;