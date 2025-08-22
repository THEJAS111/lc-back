import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

function Admin() {
  const adminOptions = [
    {
      id: "create",
      title: "Create Problem",
      description: "Add a new coding problem to the platform.",
      icon: Plus,
      color: "bg-green-600",
      route: "/admin/create",
    },
    {
      id: "delete",
      title: "Delete Problem",
      description: "Remove problems from the platform.",
      icon: Trash2,
      color: "bg-red-600",
      route: "/admin/delete",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="py-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          Admin Panel
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-400 mt-2"
        >
          Manage coding problems on your platform
        </motion.p>
      </header>

      {/* Options Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {adminOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <div
                  className={`${option.color} w-16 h-16 flex items-center justify-center rounded-full mb-4`}
                >
                  <Icon size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
                <p className="text-gray-400 mb-6">{option.description}</p>
                <NavLink
                  to={option.route}
                  className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {option.title}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-700">
        © {new Date().getFullYear()} CodeMaster Admin. All rights reserved.
      </footer>
    </div>
  );
}

export default Admin;
