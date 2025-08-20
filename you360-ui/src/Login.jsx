
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Inform App.jsx
      onLoginSuccess(data.user);

    } catch (error) {
      console.error("Auth error:", error);
      alert("Server error. Try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen p-6"
    >
      <div className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-8">
          {isSignup ? "Sign Up" : "Login"}
        </h1>

        <div className="space-y-4">
          {isSignup && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
              placeholder="Name"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
            placeholder="Password"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAuth}
          className="w-full mt-6 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg transform transition-transform duration-300 shadow-lg"
        >
          {isSignup ? "Sign Up" : "Login"}
        </motion.button>

        <div className="mt-4 text-center text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSignup(!isSignup)}
            className="text-purple-600 font-semibold hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
