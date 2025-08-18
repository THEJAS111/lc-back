import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { registerUser, clearAuthError } from "../authsilce";

const signupSchema = z.object({
  firstname: z.string().min(3, "Minimum 3 characters required"),
  emailid: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak"),
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);


  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8"
      >
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="flex justify-center items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              CM
            </div>
            <h2 className="text-3xl font-bold text-white">CodeMaster</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Create your account to start solving coding challenges
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded bg-red-500/20 text-red-300 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* First Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-300 font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              className={`w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.firstname ? "ring-2 ring-red-500" : ""
              }`}
              {...register("firstname")}
            />
            {errors.firstname && (
              <p className="text-red-400 text-xs mt-1">
                {errors.firstname.message}
              </p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-300 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.emailid ? "ring-2 ring-red-500" : ""
              }`}
              {...register("emailid")}
            />
            {errors.emailid && (
              <p className="text-red-400 text-xs mt-1">
                {errors.emailid.message}
              </p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-gray-300 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full px-4 py-2 rounded-md bg-gray-700 text-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.password ? "ring-2 ring-red-500" : ""
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="submit"
              className={`w-full py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 text-gray-400 text-sm"
        >
          Already have an account?{" "}
          <NavLink to="/login" className="text-blue-400 hover:underline">
            Login
          </NavLink>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Signup;
