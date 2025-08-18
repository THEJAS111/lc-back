import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosclient";
import { Trash2 } from "lucide-react";

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/problem/getallproblem");
      setProblems(data);
    } catch (err) {
      setError("Failed to fetch problems");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete problem");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-center mb-8"
      >
        Delete Problems
      </motion.h1>

      <div className="overflow-x-auto text-gray-100 rounded-lg shadow-lg">
        <table className="table w-full">
          <thead className="text-gray-100">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <motion.tr
                key={problem._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors"
              >
                <td>{index + 1}</td>
                <td className="font-medium">{problem.title}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      problem.difficulty === "Easy"
                        ? "bg-green-600 text-white"
                        : problem.difficulty === "Medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full border border-gray-500 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(problem._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-1 justify-center mx-auto"
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDelete;
