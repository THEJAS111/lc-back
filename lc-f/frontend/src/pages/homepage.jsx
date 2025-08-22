import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosclient";
import { logoutUser } from "../authsilce";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useWindowSize } from "react-use";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastSolved, setLastSolved] = useState(null);
  const { width, height } = useWindowSize();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getallproblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemsolvedbyuser");
        setSolvedProblems(data);

        // Check for streak (mock implementation)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (data.length > 0) {
          const lastSolvedDate = new Date(
            data[data.length - 1].solvedAt || new Date()
          );
          if (lastSolvedDate.toDateString() === today.toDateString()) {
            setStreak((prev) => prev + 1);
          } else if (
            lastSolvedDate.toDateString() === yesterday.toDateString()
          ) {
            setStreak((prev) => (prev > 0 ? prev + 1 : 1));
          } else {
            setStreak(1);
          }
          setLastSolved(lastSolvedDate);
        }
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  useEffect(() => {
    if (solvedCount > 0 && solvedCount === totalProblems) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [solvedProblems]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch =
      filters.tag === "all" || problem.tags.includes(filters.tag);
    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" &&
        solvedProblems.some((sp) => sp._id === problem._id));
    const searchMatch =
      searchQuery === "" ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (problem.description &&
        problem.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  // Calculate progress stats
  const totalProblems = problems.length;
  const solvedCount = solvedProblems.length;
  const remainingCount = totalProblems - solvedCount;
  const progressPercentage =
    totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Prepare data for difficulty distribution chart
  const difficultyData = [
    {
      name: "Easy",
      value: problems.filter((p) => p.difficulty === "easy").length,
      color: "#4CAF50",
    },
    {
      name: "Medium",
      value: problems.filter((p) => p.difficulty === "medium").length,
      color: "#FFC107",
    },
    {
      name: "Hard",
      value: problems.filter((p) => p.difficulty === "hard").length,
      color: "#F44336",
    },
  ];

  // Get daily challenge problem (mock implementation)
  const dailyChallenge =
    problems.length > 0
      ? problems[new Date().getDate() % problems.length]
      : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative pb-10">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full py-4 px-6 bg-gray-800 shadow-sm z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              CM
            </div>
            <span className="font-bold text-lg">CodeMaster</span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Admin
              </NavLink>
            )}

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.firstname?.charAt(0).toUpperCase()}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <ul className="mt-2 p-2 shadow-lg menu menu-sm dropdown-content bg-gray-700 rounded-md w-52 border border-gray-600 z-50">
                <li>
                  <NavLink
                    to="/profile"
                    className="text-gray-300 hover:bg-gray-600 py-2 px-4 rounded-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a5 5 0 00-5 5v1a5 5 0 0010 0V7a5 5 0 00-5-5zM4 14a6 6 0 0112 0v2a1 1 0 11-2 0v-2a4 4 0 00-8 0v2a1 1 0 11-2 0v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Profile
                  </NavLink>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-gray-600 py-2 px-4 rounded-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-24">
        {/* Progress Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 col-span-2 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Your Progress</span>
                <span className="text-gray-300">
                  {solvedCount} / {totalProblems}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <motion.div
                  className="bg-blue-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {solvedCount}
                </div>
                <div className="text-sm text-gray-400">Solved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {remainingCount}
                </div>
                <div className="text-sm text-gray-400">Remaining</div>
              </div>
            </div>
          </div>
        </div>
        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Today's Challenge
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-800 to-blue-700 rounded-lg shadow-sm border border-blue-500 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      <NavLink
                        to={`/problem/${dailyChallenge._id}`}
                        className="hover:text-yellow-200 transition-colors flex items-center gap-2"
                      >
                        {dailyChallenge.title}
                        <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full">
                          Daily
                        </span>
                      </NavLink>
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                          dailyChallenge.difficulty
                        )}`}
                      >
                        {dailyChallenge.difficulty}
                      </span>
                      {dailyChallenge.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <NavLink
                    to={`/problem/${dailyChallenge._id}`}
                    className="px-4 py-2 bg-yellow-500 text-yellow-900 rounded-md hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap font-bold"
                  >
                    Solve Challenge
                  </NavLink>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Problem Explorer</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search problems..."
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 flex-grow max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Only</option>
            </select>

            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                          {problem.title}
                          {solvedProblems.some(
                            (sp) => sp._id === problem._id
                          ) && (
                            <span className="text-green-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </NavLink>
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Solve Challenge
                    </NavLink>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
              <div className="text-gray-400 text-lg mb-4">
                No problems found matching your filters
              </div>
              <button
                onClick={() => {
                  setFilters({ difficulty: "all", tag: "all", status: "all" });
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-900 text-green-200";
    case "medium":
      return "bg-yellow-900 text-yellow-200";
    case "hard":
      return "bg-red-900 text-red-200";
    default:
      return "bg-gray-700 text-gray-300";
  }
};

export default Homepage;
