import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosclient";
import { useForm } from "react-hook-form";
import SubmissionHistory from "../components/submithistory";
import ChatAi from "../components/chatai";
import { motion } from "framer-motion";

const langMap = {
  "c++": "C++",
  java: "Java",
  javascript: "JavaScript",
  python: "Python",
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("c++");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/problembyid/${problemId}`
        );

        const normalizedData = {
          ...response.data,
          startCode: response.data.startcode,
          referenceSolution: response.data.referencesolution,
          driverCode: response.data.drivercode,
          visibleTestCases: response.data.visibletestcases,
          hiddenTestCases: response.data.hiddentestcases,
        };

        setProblem(normalizedData);

        const initialCode =
          normalizedData.startCode?.find((sc) => sc.language === "c++")
            ?.initialcode || "";

        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching problem:", error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode =
        problem.startCode?.find((sc) => sc.language === selectedLanguage)
          ?.initialcode || "";
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => setCode(value || "");
  const handleEditorDidMount = (editor) => (editorRef.current = editor);
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        setRunResult({
          success: false,
          error: data?.compile_output || "Compilation Error",
          runtestcases: [],
        });
      } else {
        const allPassed = data.every((tc) => tc.status_id === 3);
        setRunResult({
          success: allPassed,
          runtestcases: data,
        });
      }
      setRunLoading(false);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: "Internal server error",
        runtestcases: [],
      });
      setRunLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setSubmitLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        { code: code, language: selectedLanguage }
      );
      setSubmitResult(response.data);
      setSubmitLoading(false);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult(null);
      setSubmitLoading(false);
      setActiveRightTab("result");
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "c++":
        return "cpp";
      case "python":
        return "python";
      default:
        return "javascript";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900 text-gray-100">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-1/2 flex flex-col border-r border-gray-700"
      >
        <div className="flex bg-gray-800">
          {["description", "solutions", "submissions", "chatAI"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeLeftTab === tab
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === "description" && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div
                      className={`px-3 py-1 rounded-full border ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)}
                    </div>
                    <div className="flex gap-2">
                      {problem.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                    {problem.description}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">
                      Examples:
                    </h3>
                    {problem.visibleTestCases?.map((example, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700"
                      >
                        <h4 className="font-semibold mb-2 text-white">
                          Example {index + 1}:
                        </h4>
                        <div className="space-y-2 text-sm font-mono text-gray-300">
                          <div>
                            <strong>Input:</strong> {example.input}
                          </div>
                          <div>
                            <strong>Output:</strong> {example.output}
                          </div>
                          {example.explanation && (
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLeftTab === "solutions" && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  {problem.referenceSolution?.map((solution, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 rounded-lg mb-6"
                    >
                      <div className="bg-gray-800 px-4 py-2 rounded-t-lg">
                        <h3 className="font-semibold">
                          {problem?.title} - {solution?.language}
                        </h3>
                      </div>
                      <div className="p-4">
                        <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                          <code>{solution?.completecode}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeLeftTab === "submissions" && (
                <SubmissionHistory problemId={problemId} />
              )}

              {activeLeftTab === "chatAI" && <ChatAi problem={problem} />}
            </>
          )}
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-1/2 flex flex-col"
      >
        <div className="flex bg-gray-800">
          {["code", "testcase", "result"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeRightTab === tab
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col bg-gray-900">
          {activeRightTab === "code" && (
            <>
              <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                  {["c++", "java", "javascript", "python"].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedLanguage === lang
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {langMap[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                  }}
                />
              </div>

              <div className="p-4 border-t border-gray-700 flex justify-between bg-gray-800">
                <button
                  className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                  onClick={() => setActiveRightTab("testcase")}
                >
                  Console
                </button>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-sm ${
                      runLoading ? "opacity-50" : ""
                    }`}
                    onClick={handleRun}
                    disabled={runLoading}
                  >
                    {runLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Run"
                    )}
                  </button>
                  <button
                    className={`px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm ${
                      submitLoading ? "opacity-50" : ""
                    }`}
                    onClick={handleSubmitCode}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeRightTab === "testcase" && (
            <div className="p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                runResult.error ? (
                  <div className="text-red-400 font-mono whitespace-pre-wrap">
                    ❌ Compilation Error:
                    <br />
                    {runResult.error}
                  </div>
                ) : (
                  <>
                    <div
                      className={`mb-4 font-bold ${
                        runResult.success ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {runResult.success
                        ? "✅ All test cases passed!"
                        : "❌ Some test cases failed"}
                    </div>
                    {runResult.runtestcases.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">
                            Test Case {index + 1}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              testCase.status_id === 3
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {testCase.status_id === 3 ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm font-mono text-gray-300">
                          <div>
                            <strong>Input:</strong> {testCase.input}
                          </div>
                          <div>
                            <strong>Expected Output:</strong>{" "}
                            {testCase.expected_output}
                          </div>
                          <div>
                            <strong>Your Output:</strong>{" "}
                            {testCase.stdout || "No output"}
                          </div>
                          {testCase.stderr && (
                            <div className="text-red-400">
                              <strong>Error:</strong> {testCase.stderr}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code.
                </div>
              )}
            </div>
          )}

          {activeRightTab === "result" && (
            <div className="p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                submitResult.status === "accepted" ? (
                  <div className="text-green-400">
                    � Accepted — Passed {submitResult.testcasespassed}/
                    {submitResult.testcasestotal}
                  </div>
                ) : (
                  <div className="text-red-400">
                    ❌ {submitResult.errormessage}
                  </div>
                )
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProblemPage;
