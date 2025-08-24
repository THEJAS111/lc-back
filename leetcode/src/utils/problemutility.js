const axios = require('axios');

const getlanguagebyid = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python":71
  };
  return language[lang.toLowerCase()];
};


const submitbatch = async (submissions) => {
  // Base64 encode fields for each submission
  const encodedSubmissions = submissions.map(
    ({ source_code, language_id, stdin, expected_output }) => ({
      source_code: Buffer.from(source_code || "").toString("base64"),
      language_id,
      stdin: Buffer.from(stdin || "").toString("base64"),
      expected_output: Buffer.from(expected_output || "").toString("base64"),
    })
  );

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "true", // must be 'true' when sending base64 data
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE_KEY, 
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions: encodedSubmissions,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log("Submit batch error:", error.response?.data || error.message);
  }
};


const waiting = async (timer) => {
  return new Promise(resolve => setTimeout(resolve, timer));
};



const df = ms => new Promise(resolve => setTimeout(resolve, ms));

const base64Decode = (str) => {
  if (!str) return str;
  // Decode base64 safely (browser & Node.js)
  if (typeof atob === 'function') {
    return atob(str);
  } else {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
};

const submittoken = async (resulttokens) => {
  const results = [];

  const fetchToken = async (token) => {
    const options = {
      method: "GET",
      url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "x-rapidapi-key": process.env.JUDGE_KEY,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(`Fetch token error for ${token}:`, error.response?.data || error.message);
      return null;
    }
  };

  for (const token of resulttokens) {
    let attempts = 0;
    let result = null;

    while (attempts < 10) {
      result = await fetchToken(token);
      if (result && result.status && result.status.id > 2) break;
      await waiting(1000);
      attempts++;
    }

    if (result) {
      // Decode base64 fields
      const decodedResult = {
        ...result,
        source_code: base64Decode(result.source_code),
        stdin: base64Decode(result.stdin),
        stdout: base64Decode(result.stdout),
        stderr: base64Decode(result.stderr),
        compile_output: base64Decode(result.compile_output),
        expected_output: base64Decode(result.expected_output),
      };
      results.push(decodedResult);
    }
  }

  console.log(results);
  return results;
};


module.exports = { getlanguagebyid, submitbatch, submittoken };

