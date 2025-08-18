import { useState } from "react";
import axiosClient from "../utils/axiosclient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Example JSON template
const exampleProblem = {
  title: "Addition of Two Numbers",
  description:
    "Write a program that takes two integers as input and returns their sum.\n\nYou need to read the two integers from standard input and output their sum to standard output.\n\n**Example:**\n```\nInput: 3 5\nOutput: 8\n```\n**Explanation:** 3 + 5 = 8",
  difficulty: "easy",
  tags: ["math", "basic-operations"],
  visibletestcases: [
    {
      input: "3 5",
      output: "8",
      explanation: "3 + 5 = 8",
    },
    {
      input: "10 20",
      output: "30",
      explanation: "10 + 20 = 30",
    },
  ],
  hiddentestcases: [
    {
      input: "-5 15",
      output: "10",
    },
    {
      input: "0 0",
      output: "0",
    },
    {
      input: "100 -50",
      output: "50",
    },
  ],
  startcode: [
    {
      language: "c++",
      initialcode:
        "#include <iostream>\nusing namespace std;\nclass Solution {\npublic:\n    int add(int a, int b) {\n        // Your code here\n    }\n};",
    },
    {
      language: "javascript",
      initialcode: "function add(a, b) {\n    // Your code here\n}",
    },
    {
      language: "python",
      initialcode: "def add(a, b):\n    # Your code here",
    },
    {
      language: "java",
      initialcode:
        "class Solution {\n    public int add(int a, int b) {\n        // Your code here\n    }\n}",
    },
  ],
  referencesolution: [
    {
      language: "c++",
      completecode:
        "#include <iostream>\nusing namespace std;\nclass Solution {\npublic:\n    int add(int a, int b) {\n        return a + b;\n    }\n};",
    },
    {
      language: "javascript",
      completecode: "function add(a, b) {\n    return a + b;\n}",
    },
    {
      language: "python",
      completecode: "def add(a, b):\n    return a + b",
    },
    {
      language: "java",
      completecode:
        "class Solution {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}",
    },
  ],
  drivercode: [
    {
      language: "c++",
      code: "#include <iostream>\nusing namespace std;\n\n// User's code inserted here\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    Solution sol;\n    cout << sol.add(a, b);\n    return 0;\n}",
    },
    {
      language: "javascript",
      code: "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.on('line', (line) => {\n    const [a, b] = line.trim().split(' ').map(Number);\n    console.log(add(a, b));\n    process.exit(0);\n});\n\n// User code here",
    },
    {
      language: "python",
      code: "a, b = map(int, input().split())\nprint(add(a, b))\n\n# User code here",
    },
    {
      language: "java",
      code: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        Solution sol = new Solution();\n        System.out.println(sol.add(a, b));\n    }\n}\n\n// User code here",
    },
  ],
};
// (exampleProblem JSON remains the same as in your original code)

function AdminPanel() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(exampleProblem, null, 2)
  );
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastValidJson, setLastValidJson] = useState(
    JSON.stringify(exampleProblem, null, 2)
  );

  const requiredKeys = [
    "title",
    "description",
    "difficulty",
    "tags",
    "visibletestcases",
    "hiddentestcases",
    "startcode",
    "referencesolution",
    "drivercode",
  ];

  const handleJsonChange = (e) => {
    const newValue = e.target.value;
    setJsonInput(newValue);

    // Try to parse but don't prevent editing even if invalid
    try {
      JSON.parse(newValue);
      setError(null); // Clear error if JSON is valid
    } catch (err) {
      // Don't set error here - let them keep typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const problemData = JSON.parse(jsonInput);

      // Validation checks (only on submit)
      const missingKeys = requiredKeys.filter((key) => !(key in problemData));
      if (missingKeys.length > 0) {
        throw new Error(`There is an error in the code please fix it`);
      }

      if (!problemData.title || !problemData.description) {
        throw new Error("There is an error in the code please fix it");
      }

      if (!["easy", "medium", "hard"].includes(problemData.difficulty)) {
        throw new Error("There is an error in the code please fix it");
      }

      if (!Array.isArray(problemData.tags)) {
        throw new Error("There is an error in the code please fix it");
      }

      if (
        !Array.isArray(problemData.visibletestcases) ||
        problemData.visibletestcases.length === 0
      ) {
        throw new Error("There is an error in the code please fix it");
      }

      if (
        !Array.isArray(problemData.hiddentestcases) ||
        problemData.hiddentestcases.length === 0
      ) {
        throw new Error("There is an error in the code please fix it");
      }

      const requiredLanguages = ["c++", "javascript", "python", "java"];
      const checkCodeTemplates = (fieldName, array) => {
        if (!Array.isArray(array) || array.length !== 4) {
          throw new Error(`There is an error in the code please fix it`);
        }

        const languages = array.map((item) => item.language);
        if (!requiredLanguages.every((lang) => languages.includes(lang))) {
          throw new Error(`There is an error in the code please fix it`);
        }
      };

      checkCodeTemplates("startcode", problemData.startcode);
      checkCodeTemplates("referencesolution", problemData.referencesolution);
      checkCodeTemplates("drivercode", problemData.drivercode);

      const response = await axiosClient.post("/problem/create", {
        ...problemData,
        problemcreator: "HARDCODE_OR_BACKEND_EXTRACT",
      });

      alert("Problem created successfully!");
      navigate("/");
    } catch (err) {
      setError("There is an error in the code please fix it");
      console.error("Error creating problem:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = () => {
    const example = JSON.stringify(exampleProblem, null, 2);
    setJsonInput(example);
    setLastValidJson(example);
    setError(null);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setLastValidJson(formatted);
      setError(null);
    } catch (err) {
      setError("There is an error in the code please fix it");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full py-4 px-6 bg-gray-800 shadow-sm z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              CM
            </div>
            <span className="font-bold text-lg">CodeMaster Admin</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            Create New <span className="text-blue-400">Coding Problem</span>
          </h1>
          <p className="text-gray-400">
            Enter your problem data in JSON format below
          </p>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-blue-400">📋</span> Problem Structure Guide
          </h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Required Fields:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {requiredKeys.map((key) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-700 p-3 rounded-md"
                >
                  <div className="font-mono font-bold text-blue-400">{key}</div>
                  <div className="text-sm text-gray-300">
                    {key === "difficulty"
                      ? 'One of "easy", "medium", or "hard"'
                      : key === "tags"
                      ? 'Array of tags (e.g., ["array", "math"])'
                      : key.includes("testcases")
                      ? "Array of objects with input/output"
                      : key.includes("code")
                      ? "Array of language-specific code templates"
                      : "Required field"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Example Structure:</h3>
            <pre className="text-sm overflow-x-auto p-4 bg-gray-900 rounded text-gray-300">
              {JSON.stringify(
                {
                  title: "Problem Title",
                  description: "Problem description...",
                  difficulty: "easy",
                  tags: ["array"],
                  visibletestcases: [
                    { input: "1 2", output: "3", explanation: "1 + 2 = 3" },
                  ],
                  hiddentestcases: [{ input: "3 4", output: "7" }],
                  startcode: [
                    { language: "c++", initialcode: "// Starter code..." },
                  ],
                  referencesolution: [
                    { language: "c++", completecode: "// Solution code..." },
                  ],
                  drivercode: [{ language: "c++", code: "// Driver code..." }],
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={handleLoadExample}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-blue-700 text-white rounded-md flex items-center gap-2"
            >
              <span>📝</span> Load Complete Example
            </motion.button>
            <motion.button
              type="button"
              onClick={handleFormatJson}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-purple-700 text-white rounded-md flex items-center gap-2"
            >
              <span>✨</span> Format JSON
            </motion.button>
          </div>
        </motion.div>

        {/* JSON Editor */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-lg font-medium mb-2">
              Problem JSON Editor
            </label>
            <textarea
              value={jsonInput}
              onChange={handleJsonChange}
              className="w-full h-96 p-4 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              spellCheck="false"
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 flex items-start gap-2"
              >
                <span className="text-red-400">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          <motion.div
            className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm py-4 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full py-3 rounded-md font-medium ${
                isLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🌀</span>
                  Creating Problem...
                </div>
              ) : (
                "Create Problem"
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}

export default AdminPanel;
