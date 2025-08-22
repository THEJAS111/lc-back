const express=require('express');
const aiRouter=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const solvedoubt=require('../controllers/solvedoubt')


aiRouter.post("/chat",usermiddleware,solvedoubt);

module.exports=aiRouter;