import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosclient";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];
const HEATMAP_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

const Profile = () => {
  const navigate = useNavigate();
  const [allProblems, setAllProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streakStats, setStreakStats] = useState({ current: 0, longest: 0 });
  const [problemMap, setProblemMap] = useState({});
  const [heatmapTooltip, setHeatmapTooltip] = useState({
    visible: false,
    date: "",
    count: 0,
    x: 0,
    y: 0,
  });
  const heatmapRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [allRes, solvedRes, subsRes] = await Promise.all([
          axiosClient.get("/problem/getallproblem").catch(() => ({ data: [] })),
          axiosClient
            .get("/problem/problemsolvedbyuser")
            .catch(() => ({ data: [] })),
          axiosClient.get("/problem/submittedall").catch(() => ({ data: [] })),
        ]);

        setAllProblems(allRes?.data || []);
        setSolvedProblems(solvedRes?.data || []);
        setSubmissions(subsRes?.data || []);

        const map = {};
        (solvedRes?.data || []).forEach((problem) => {
          map[problem._id] = problem.title;
        });
        (allRes?.data || []).forEach((problem) => {
          if (!map[problem._id]) {
            map[problem._id] = problem.title;
          }
        });
        setProblemMap(map);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const heatmapData = useMemo(() => {
    if (!Array.isArray(submissions)) return [];

    const counts = {};
    submissions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      if (!isNaN(date)) {
        const dateStr = date.toISOString().split("T")[0];
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });
    return Object.keys(counts).map((date) => ({ date, count: counts[date] }));
  }, [submissions]);

  useEffect(() => {
    if (!Array.isArray(submissions)) return;
    if (submissions.length === 0) {
      setStreakStats({ current: 0, longest: 0 });
      return;
    }

    const uniqueDates = [
      ...new Set(
        submissions.map(
          (s) => new Date(s.createdAt).toISOString().split("T")[0]
        )
      ),
    ].sort();

    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (uniqueDates.includes(today)) {
      currentStreak = 1;
      let prevDate = yesterdayStr;
      while (uniqueDates.includes(prevDate)) {
        currentStreak++;
        const d = new Date(prevDate);
        d.setDate(d.getDate() - 1);
        prevDate = d.toISOString().split("T")[0];
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    setStreakStats({ current: currentStreak, longest: longestStreak });
  }, [submissions]);

  const monthlySubmissions = useMemo(() => {
    if (!Array.isArray(submissions))
      return Array(12)
        .fill(0)
        .map((_, i) => ({
          name: new Date(0, i).toLocaleString("default", { month: "short" }),
          submissions: 0,
        }));

    const months = Array(12)
      .fill(0)
      .map((_, i) => ({
        name: new Date(0, i).toLocaleString("default", { month: "short" }),
        submissions: 0,
      }));

    const currentYear = new Date().getFullYear();

    submissions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      if (date.getFullYear() === currentYear) {
        months[date.getMonth()].submissions++;
      }
    });

    return months;
  }, [submissions]);

  const languageStats = useMemo(() => {
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return [{ name: "No submissions yet", value: 1 }];
    }

    const langCount = {};
    submissions.forEach((sub) => {
      langCount[sub.language] = (langCount[sub.language] || 0) + 1;
    });

    const stats = Object.entries(langCount).map(([name, value]) => ({
      name,
      value,
    }));
    return stats.length > 0
      ? stats
      : [{ name: "No submissions yet", value: 1 }];
  }, [submissions]);

  const successRate = useMemo(() => {
    if (!Array.isArray(submissions)) return 0;

    const total = submissions.length;
    const accepted = submissions.filter((s) => s.status === "accepted").length;
    return total > 0 ? Math.round((accepted / total) * 100) : 0;
  }, [submissions]);

  const recentSubmissions = useMemo(() => {
    if (!Array.isArray(submissions)) return [];

    return [...submissions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [submissions]);

  const getHeatmapClass = (value) => {
    if (!value || value.count === 0) return "color-empty";
    if (value.count >= 10) return "color-scale-4";
    if (value.count >= 7) return "color-scale-3";
    if (value.count >= 4) return "color-scale-2";
    if (value.count >= 1) return "color-scale-1";
    return "color-empty";
  };

  const handleHeatmapMouseOver = (event, value) => {
    if (!value || value.count === 0) return;

    const rect = event.target.getBoundingClientRect();
    setHeatmapTooltip({
      visible: true,
      date: new Date(value.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      count: value.count,
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY - 40,
    });
  };

  const handleHeatmapMouseLeave = () => {
    setHeatmapTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <span className="font-bold text-lg">CodeMaster</span>
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
            Browse Problems
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 justify-center"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-800 shadow-lg rounded-xl p-6 text-center border border-gray-700"
          >
            <h3 className="text-gray-400 text-sm font-medium">
              Problems Solved
            </h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {solvedProblems.length}
              <span className="text-gray-500 text-sm font-normal ml-1">
                / {allProblems.length}
              </span>
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-800 shadow-lg rounded-xl p-6 text-center border border-gray-700"
          >
            <h3 className="text-gray-400 text-sm font-medium">
              Current Streak
            </h3>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {streakStats.current} days
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-800 shadow-lg rounded-xl p-6 text-center border border-gray-700"
          >
            <h3 className="text-gray-400 text-sm font-medium">
              Longest Streak
            </h3>
            <p className="text-3xl font-bold text-amber-400 mt-2">
              {streakStats.longest} days
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-800 shadow-lg rounded-xl p-6 text-center border border-gray-700"
          >
            <h3 className="text-gray-400 text-sm font-medium">Success Rate</h3>
            <p className="text-3xl font-bold text-cyan-400 mt-2">
              {successRate}%
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Heatmap */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "50px" }}
          transition={{ duration: 0.4 }}
          className="bg-gray-800 shadow-lg rounded-2xl p-6 mb-8 relative"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold text-white">
              Submission Activity
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">Less</span>
                {HEATMAP_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2">More</span>
              </div>
              <div className="hidden sm:block text-sm text-gray-400">
                {heatmapData.length} days with submissions
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div
            ref={heatmapRef}
            className="overflow-x-auto pb-4 relative scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            style={{ scrollbarGutter: "stable" }}
            onMouseLeave={handleHeatmapMouseLeave}
          >
            <div className="min-w-max">
              <CalendarHeatmap
                startDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
                endDate={new Date()}
                values={heatmapData}
                classForValue={getHeatmapClass}
                showWeekdayLabels={true}
                gutterSize={3}
                transformDayElement={(element, value) =>
                  React.cloneElement(element, {
                    onMouseOver: (e) => handleHeatmapMouseOver(e, value),
                    onMouseLeave: handleHeatmapMouseLeave,
                    rx: 3,
                    ry: 3,
                    style: {
                      transition: "fill 0.15s ease",
                      shapeRendering: "geometricPrecision",
                      vectorEffect: "non-scaling-stroke",
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Tooltip */}
          {heatmapTooltip.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute z-20 bg-gray-900 text-white text-xs py-1.5 px-2 rounded shadow-lg pointer-events-none border border-gray-700 whitespace-nowrap"
              style={{
                left: `${Math.min(
                  Math.max(heatmapTooltip.x, 60),
                  (heatmapRef.current?.clientWidth || 0) - 60
                )}px`,
                top: `${heatmapTooltip.y + 10}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-medium">{heatmapTooltip.date}</div>
              <div>
                {heatmapTooltip.count}{" "}
                {heatmapTooltip.count === 1 ? "submission" : "submissions"}
              </div>
            </motion.div>
          )}

          <div className="sm:hidden text-sm text-gray-400 mt-2">
            {heatmapData.length} days with submissions
          </div>

          <style global={true}>{`
            .react-calendar-heatmap {
              font-family: inherit;
            }
            .react-calendar-heatmap .color-empty {
              fill: #2d3748;
            }
            .react-calendar-heatmap .color-scale-1 {
              fill: #9be9a8;
            }
            .react-calendar-heatmap .color-scale-2 {
              fill: #40c463;
            }
            .react-calendar-heatmap .color-scale-3 {
              fill: #30a14e;
            }
            .react-calendar-heatmap .color-scale-4 {
              fill: #216e39;
            }
            .react-calendar-heatmap rect:hover {
              stroke: #ffffff;
              stroke-width: 1px;
              stroke-opacity: 1;
            }
            .react-calendar-heatmap text {
              fill: #a0aec0;
              font-size: 10px;
            }
            .react-calendar-heatmap .color-empty {
              rx: 3;
              ry: 3;
            }
          `}</style>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 shadow-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Monthly Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySubmissions}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#4a5568"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a0aec0" }}
                  axisLine={{ stroke: "#4a5568" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#a0aec0" }}
                  axisLine={{ stroke: "#4a5568" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2d3748",
                    border: "1px solid #4a5568",
                    borderRadius: "0.5rem",
                    color: "#f7fafc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#4F46E5"
                  fill="url(#colorUv)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  activeDot={{
                    r: 6,
                    stroke: "#4F46E5",
                    strokeWidth: 2,
                    fill: "#2d3748",
                  }}
                />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Language Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 shadow-lg rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Language Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={({ name, percent }) =>
                    languageStats[0].name === "No submissions yet"
                      ? name
                      : `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {languageStats.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        languageStats[0].name === "No submissions yet"
                          ? "#4a5568"
                          : COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) =>
                    languageStats[0].name === "No submissions yet"
                      ? [name, ""]
                      : [`${value} submissions`, ""]
                  }
                  contentStyle={{
                    backgroundColor: "#2d3748",
                    border: "1px solid #4a5568",
                    borderRadius: "0.5rem",
                    color: "#f7fafc",
                  }}
                />
                {languageStats[0].name !== "No submissions yet" && (
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value) => (
                      <span className="text-gray-300 text-sm">{value}</span>
                    )}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
