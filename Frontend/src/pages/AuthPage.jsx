import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBook } from "react-icons/fa";
import { motion } from "framer-motion";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && form.password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        const res = await axios.post(
          "https://localhost:8081/auth/login",
          { username: form.username, password: form.password },
          { withCredentials: true }
        );

        const token = res?.data?.token || res?.data?.jwt;
        const user = res?.data?.user || res?.data?.data || { role: "USER" };

        if (!token) throw new Error("Invalid username/password");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        if (user.role === "ADMIN") navigate("/admin");
        else navigate("/dashboard");
      } else {
        await axios.post(
          "https://localhost:8081/api/user/register",
          { username: form.username, password: form.password },
          { withCredentials: true }
        );

        setForm({ username: "", password: "" });
        setIsLogin(true);
        setMessage({
          text: "Account created successfully! Please login.",
          type: "success",
        });
      }
    } catch (err) {
      let msg = "Authentication failed";

      if (err.response) {
        if (isLogin) {
          msg = "Invalid username/password";
        } else {
          msg =
            err.response.status === 403
              ? "Username already exists"
              : err.response.data?.message || "Registration failed";
        }
      } else {
        msg = err.message || msg;
      }

      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <motion.div
        className="flex items-center mb-8 space-x-3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 10 }}
      >
        <motion.div
          className="text-blue-600 text-4xl"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FaBook />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          WDU Digital Library
        </h1>
      </motion.div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        {message.text && (
          <div
            className={`mb-4 font-medium text-center ${
              message.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <span
            className="text-blue-600 cursor-pointer ml-1 hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage({ text: "", type: "" });
            }}
          >
            {isLogin ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
