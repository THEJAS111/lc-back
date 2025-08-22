const { getlanguagebyid, submitbatch, submittoken,solveallproblembyuser } = require('../utils/problemutility');
const problem = require("../models/problem");
const User=require("../models/user");
const submission = require('../models/submission');


const createproblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibletestcases,
    hiddentestcases,
    startcode,
    referencesolution,
    drivercode,
    problemcreator,
  } = req.body;

  const alltestcases = [...visibletestcases, ...hiddentestcases];

  try {
    // ✅ Validate reference solution merged with driver code
    for (const { language, completecode } of referencesolution) {
      const languageid = getlanguagebyid(language);

      // 🔍 Find corresponding driver code
      const driver = drivercode.find(
        (dc) => dc.language.toLowerCase() === language.toLowerCase()
      );
      if (!driver) {
        return res
          .status(400)
          .send(`Missing driver code for language: ${language}`);
      }

      // ✅ Replace placeholder or append (flexible)
      const fullCode = `${completecode}\n${driver.code}`;

      // ✅ Prepare submissions
      const submissions = visibletestcases.map((testcase) => ({
        source_code: fullCode,
        language_id: languageid,
        stdin:testcase.input,
        expected_output: testcase.output,
      }));

      const submitresult = await submitbatch(submissions);
      const resulttoken = submitresult.map((value) => value.token);
      const testresult = await submittoken(resulttoken);

      for (const test of testresult) {
        if (test.status_id !== 3) {
          return res
            .status(400)
            .send("Reference solution failed on some test cases");
        }
      }
    }

    // ✅ Save the problem in DB
    const userproblem = await problem.create({
      title,
      description,
      difficulty,
      tags,
      visibletestcases,
      hiddentestcases,
      startcode,
      referencesolution,
      drivercode,
      problemcreator: req.result._id, // From auth middleware
    });

    res.status(201).send("Problem saved successfully");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error: " + err.message);
  }
};

const updateproblem=async(req,res)=>{
   
    const {id}=req.params;
     const {
        title, description, difficulty, tags,
        visibletestcases, hiddentestcases, startcode, referencesolution,
        problemcreator
    } = req.body;

    try{
        if(!id){
           return res.send("id is missing ")
        }
        const dsaproblem=await problem.findById(id);
        if(!id){
            return res.status(404).send("id is not present in the server");
        }

         for (const { language, completecode } of referencesolution) {
            const languageid = getlanguagebyid(language);
            const submissions = visibletestcases.map((testcase) => ({
                source_code: completecode,
                language_id: languageid,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitresult = await submitbatch(submissions);
            const resulttoken = submitresult.map((value) => value.token);
            const testresult = await submittoken(resulttoken);
            

            for (const test of testresult) {
                if (test.status_id != 3)
                    return res.status(400).send("some error has occurred");
            }
        }

        const newproblem=await problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
        res.status(200).send(newproblem);
    }
    catch(err){
         res.status(404).send("error has occured :"+err);
    }

};

const deleteproblem=async(req,res)=>{
   const {id}=req.params;

   try{
        if(!id){
           return res.send("id is missing ")
        }
        const dsaproblem=await problem.findById(id);
        if(!id){
            return res.status(404).send("id is not present in the server");
        }
        const deletedproblem= await problem.findByIdAndDelete(id);
        if(!deletedproblem){
            return res.status(404).send("problem is missing ");
        }
        res.status(200).send("succesfully deleted");
     }
      catch(err){
         res.status(404).send("error has occured :"+err);
    }

};

const getproblembyid=async(req,res)=>{
       const {id}=req.params;

   try{
        if(!id){
           return res.send("id is missing ")
        }
        const getproblem=await problem.findById(id);
        //const getproblem=await problem.findById(id).select('_id title description');
        //if you want to send only some selected items

        if(!getproblem){
            return res.status(404).send("problem is missing");
        }
      return res.status(200).send(getproblem);
       
     }
      catch(err){
         res.status(404).send("error has occured :"+err);
    }
}

const getallproblem=async(req,res)=>{
     

   try{
    
        const getproblem=await problem.find({}).select(' _id title difficulty tags');

        if(!getproblem){
            return res.status(404).send("problem is missing");
        }
        return res.status(200).send(getproblem);

     }
      catch(err){
         res.status(404).send("error has occured :"+err);
    }
}

const solvedallproblembyuser=async(req,res)=>{
    try{
        
     const userid=req.result._id;

     const user=await User.findById(userid).populate({path:"problemsolved",
        select:"_id title difficulty tags"
     });
    
     res.status(200).send(user.problemsolved);


    }
    catch(err){
       res.status(404).send("error has occured :"+err);
    }
}
const submittedproblem=async(req,res)=>{
     try{
        
       const userid = req.result._id;
       const problemid = req.params.pid;
   
      const ans = await submission.find({userid,problemid});
     
     if(ans.length===0)
      return  res.status(200).send("No Submission is persent");
   
     return res.status(200).send(ans);
   
     }
     catch(err){
        res.status(500).send("no idea what happened ");
     }
}
const submittedall=async(req,res)=>{
  try{
  const userid = req.result._id;

       const ans = await submission.find({ userid: userid });
     
     if(ans.length===0)
      return  res.status(200).send("Nothing  is present");
   
     return res.status(200).send(ans);
   
     }
     catch(err){
        res.status(500).send("no idea what happened ");
     
}
}



module.exports = {createproblem,updateproblem,deleteproblem,getproblembyid,getallproblem,solvedallproblembyuser,submittedproblem,submittedall};
