const Problem = require("../models/problem");
const submission = require("../models/submission");
const {
  getlanguagebyid,
  submitbatch,
  submittoken,
} = require("../utils/problemutility");

const submitcode = async (req, res) => {
  const userid = req.result._id;
  const problemid = req.params.id;
  try {
    let { code, language } = req.body;

    if (!userid || !code || !problemid || !language) {
      return res.status(400).send("some fields are missing ");
    }
    if (language === "cpp") language = "c++";
    const problem = await Problem.findById(problemid);
    const selectedLanguage = "c++";
    const driver = problem.drivercode.find(
      (entry) => entry.language.toLowerCase() === language.toLowerCase()
    );

    if (!driver) {
      throw new Error(`Driver code for language '${language}' not found`);
    }

    const fullcode = driver.code.includes("// User code here")
      ? driver.code.replace("// User code here", code)
      : `${code}\n${driver.code}`;

    const submittedresult = await submission.create({
      userid,
      problemid,
      code,
      language,
      testcasespassed: 0,
      status: "pending",
      testcasestotal: problem.hiddentestcases.length,
    });
    const languageid = getlanguagebyid(language);

    const submissions = problem.hiddentestcases.map((testcase) => ({
      source_code: fullcode,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitresult = await submitbatch(submissions);
    const resulttoken = submitresult.map((value) => value.token);
    const testresult = await submittoken(resulttoken);

    let testcasespassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errormessage = "";

    for (const test of testresult) {
      if (test.status_id == 3) {
        testcasespassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "error";
          errormessage = test.stderr;
        } else {
          status = "wrong";
        }
      }
    }
    submittedresult.status = status;
    submittedresult.testcasespassed = testcasespassed;
    submittedresult.errormessage = errormessage;
    submittedresult.runtime = runtime;
    submittedresult.memory = memory; //first storing whatever is submitted from the frontend to the database and then updating it

    await submittedresult.save();

    if (!req.result.problemsolved.includes(problemid)) {
      req.result.problemsolved.push(problemid);
      await req.result.save();
    }

    res.status(201).send(submittedresult);
  } catch (err) {
    res.status(500).send("internal error occured " + err);
  }
};
const sanitizeCode = (code) => {
  return code
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/[ \t]+$/gm, "") // Trim trailing whitespace
    .trim();
};

const sanitizeDriverCode = (code) => {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
};

const runcode = async (req, res) => {
  const userid = req.result._id;
  const problemid = req.params.id;
  try {
    let { code, language } = req.body;

    if (!userid || !code || !problemid || !language) {
      return res.status(400).send("some fields are missing ");
    }

    if (language === "cpp") language = "c++";

    const problem = await Problem.findById(problemid);

    const selectedLanguage = "c++";
    const driver = problem.drivercode.find(
      (entry) => entry.language.toLowerCase() === language.toLowerCase()
    );

    if (!driver) {
      throw new Error(`Driver code for language '${language}' not found`);
    }

    const languageid = getlanguagebyid(language);

     let fullcode =  `${code}\n${driver.code}`;

       
    const submissions = problem.visibletestcases.map((testcase) => ({
      source_code: fullcode,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitresult = await submitbatch(submissions);
    const resulttoken = submitresult.map((value) => value.token);
    const testresult = await submittoken(resulttoken);

    res.status(201).send(testresult);
  } catch (err) {
    res.status(500).send("internal error occured " + err);
  }
};




module.exports = { submitcode, runcode };
