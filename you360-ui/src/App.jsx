
import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Sparkles, Home, Camera, CalendarCheck, NotebookPen, Settings, LogIn } from "lucide-react";

// Pages
import Dashboard from "./Dashboard";
import Foodscanner from "./FoodScanner";
import Routine from "./Routine";
import Recipe from "./Recipe";
import Setting from "./Setting";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);

  // Wellness Score Example
  const [sleepHours] = useState(7.5);
  const [stepsToday] = useState(5000);
  const [sugarReading] = useState(105);

  const wellnessScore = useMemo(() => {
    let score = 55;
    score += Math.min(stepsToday / 120, 20);
    score += Math.min(Math.max(sleepHours - 6, 0) * 4, 20);
    score -= Math.max(sugarReading - 120, 0) / 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [sleepHours, stepsToday, sugarReading]);

  // 👇 Login success callback
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    window.location.href = "/"; // redirect dashboard pe
  };

  return (
    <Router>
      <div className="flex h-screen w-full bg-gradient-to-br from-indigo-200 via-violet-200 to-sky-200">
        
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/30 
          bg-gradient-to-b from-indigo-300/60 via-purple-300/50 to-sky-300/60 
          p-6 text-gray-800 backdrop-blur-xl md:block">
          
          <div className="mb-8 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-700" />
            <h1 className="text-2xl font-bold">NutriZen</h1>
          </div>

          <nav className="space-y-2">
            <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/foodscanner" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
              <Camera size={18} /> Food Scanner
            </Link>
            <Link to="/routine" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
              <CalendarCheck size={18} /> Routine
            </Link>
            <Link to="/recipe" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
              <NotebookPen size={18} /> AI Recipe
            </Link>
            <Link to="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
              <Settings size={18} /> Settings
            </Link>
            {!user ? (
              <Link to="/login" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/60">
                <LogIn size={18} /> Login
              </Link>
            ) : (
              <p className="mt-4 text-sm text-indigo-800">Hi, {user.name}</p>
            )}
          </nav>

          {/* Wellness Score Box */}
          <div className="mt-10 rounded-xl bg-white/70 p-4 text-sm leading-5 text-gray-800 shadow">
            <p className="opacity-80">Wellness Score</p>
            <p className="mt-1 text-3xl font-bold text-indigo-700">{wellnessScore}</p>
            <p className="opacity-60">/100</p>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/foodscanner" element={<Foodscanner />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/recipe" element={<Recipe />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
