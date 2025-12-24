import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!isLogin && form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // ===== LOGIN =====
        const res = await axios.post(
          "https://localhost:8081/auth/login",
          { username: form.username, password: form.password },
          { withCredentials: true }
        );

        // Extracting token and user data from common response structures
        const token = res?.data?.token || res?.data?.jwt;
        const userData = res?.data?.user || res?.data?.data || {};

        if (!token) throw new Error("Login failed: no token returned");

        // --- ROLE NORMALIZATION ---
        // Converts "ROLE_ADMIN" to "ADMIN" to match Navbar logic
        const rawRole = userData.role || "USER";
        const normalizedRole = typeof rawRole === 'string'
          ? rawRole.replace("ROLE_", "").toUpperCase()
          : "USER";

        // Save data to LocalStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", normalizedRole);

        
        if (user.role === "ADMIN") navigate("/admin");
        else navigate("/dashboard");
      } else {
        // ===== REGISTER =====
        await axios.post(
          "https://localhost:8081/api/user/register",
          { username: form.username, password: form.password },
          { withCredentials: true }
        );

        alert("Account created successfully! Please login.");
        setForm({ username: "", password: "" });
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || err?.message || "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Create Account"}
        </h2>

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

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 tracking-widest">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] ${
              loading ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Authorize" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <span
            className="text-blue-600 cursor-pointer ml-1 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? " Register" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;