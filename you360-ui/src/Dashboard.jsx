import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Camera,
  NotebookPen,
  Settings,
  CalendarCheck,
  Smile,
  Moon,
  Footprints,
  Droplet,
  HeartPulse,
  Dumbbell,
  Sparkles,
  MessageCircle,
  LogIn,
  Timer,
} from "lucide-react";

//import


// ---------------- Gemini helper (frontend-only) ----------------
const GEMINI_MODEL = "gemini-1.5-flash-latest"; // fast & cheap
async function askGemini(prompt, history = []) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

  const contents = [
    ...history.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );
  const data = await res.json();
  // defensive: pick first candidate and strip asterisks and leading/trailing whitespace
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(No reply)";
  return raw.replace(/\*/g, "").trim();
}

// ---------------- Minimal Modal ----------------
function Modal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="relative w-[92%] max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">
                ✕
              </button>
            </div>
            <div className="text-gray-700">{children}</div>
            {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------- Welcome Overlay ----------------
function WelcomeOverlay({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] grid place-items-center bg-gradient-to-br from-indigo-200/70 via-fuchsia-200/70 to-sky-200/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="mx-4 max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl"
        >
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
            <Sparkles />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to your health journey ✨</h2>
          <p className="mt-2 text-gray-600">Track mood, sleep, steps, and get smart tips powered by AI. Let’s glow up your wellness routine!</p>
          <button onClick={onClose} className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-medium text-white shadow hover:opacity-95">
            Let’s Start
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  // Summary state
  const [moodEmoji, setMoodEmoji] = useState("😊");
  const [sleepHours, setSleepHours] = useState(7.5);
  const [stepsToday, setStepsToday] = useState(0);
  const [sugarReading, setSugarReading] = useState(105);

  const [showWelcome, setShowWelcome] = useState(true);

  // Date/time card state
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const wellnessScore = useMemo(() => {
    let score = 55;
    score += Math.min(stepsToday / 120, 20);
    score += Math.min(Math.max(sleepHours - 6, 0) * 4, 20);
    score -= Math.max(sugarReading - 120, 0) / 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [sleepHours, stepsToday, sugarReading]);

  // Dialog states
  const [openMood, setOpenMood] = useState(false);
  const [openSleep, setOpenSleep] = useState(false);
  const [openHair, setOpenHair] = useState(false);
  const [openSkin, setOpenSkin] = useState(false);
  const [openSteps, setOpenSteps] = useState(false);
  const [openSugar, setOpenSugar] = useState(false);
  const [openExercise, setOpenExercise] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);

  // Inputs
  const [hairQ, setHairQ] = useState("");
  const [hairAns, setHairAns] = useState("");
  const [skinType, setSkinType] = useState("oily");
  const [skinAns, setSkinAns] = useState("");
  const [dist, setDist] = useState("");
  const [distUnit, setDistUnit] = useState("km");
  const [calcSteps, setCalcSteps] = useState(null);
  const [food, setFood] = useState("");
  const [sugarAns, setSugarAns] = useState("");
  const [exerciseMode, setExerciseMode] = useState("home");
  const [exerciseAns, setExerciseAns] = useState("");

  // Meditation
  const [medMinutes, setMedMinutes] = useState(0);
  const [medLeft, setMedLeft] = useState(0);
  const [medRunning, setMedRunning] = useState(false);
  useEffect(() => {
    if (!medRunning || medLeft <= 0) return;
    const t = setTimeout(() => setMedLeft((s) => s - 1), 1000);
    if (medLeft === 1) setMedRunning(false);
    return () => clearTimeout(t);
  }, [medRunning, medLeft]);

  // Emojis (15)
  const EMOJIS = ["😀","😊","😐","😔","😡","🥳","😭","😴","🤒","🤩","😅","😎","😤","😢","🤯"];

  // Handlers
  const saveMood = async (e) => {
    setMoodEmoji(e);
    setOpenMood(false);
    try {
      setLoading(true);
      const tip = await askGemini(`User selected mood ${e}. Provide a one-line supportive wellness tip (max 20 words).`);
      // show concise tip (no asterisks) — askGemini already strips asterisks
      alert(tip);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const analyzeSleep = async () => {
    const hours = Number(sleepHours) || 0;
    const deep = Math.round(hours * 0.22 * 10) / 10; // ~22%
    const light = Math.max(0, Math.round((hours - deep) * 10) / 10);
    try {
      setLoading(true);
      const txt = await askGemini(`I slept ${hours} hours. Give a concise sleep analysis with 2 tips and whether it's below or above 8 hours.`);
      alert(`Deep: ${deep}h\nLight: ${light}h\n\n${txt}`);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const calcStepsFromDistance = async () => {
    const d = Number(dist) || 0;
    const meters = distUnit === "km" ? d * 1000 : d;
    const steps = Math.max(0, Math.round(meters / 0.78));
    setCalcSteps(steps);
    setStepsToday((prev) => Math.max(prev, steps));
    try {
      setLoading(true);
      const msg = await askGemini(`I walked ${d} ${distUnit}. Convert to steps (assume 0.78m per step) then give one motivational line.`);
      // concise single line
      alert(msg);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // Hair flow: user enters hair issue -> prompt asks for short routine & diet, no followups
  const askHairAi = async () => {
    if (!hairQ.trim()) {
      setHairAns("Please describe your hair issue clearly (e.g. dry, hairfall, thin, oily).");
      return;
    }
    try {
      setLoading(true);
      const prompt = `User says: ${hairQ}. Provide a concise hair care routine (3 steps), two dietary recommendations, and one quick home remedy. Keep it short, do not ask follow-up questions.`;
      const reply = await askGemini(prompt);
      setHairAns(reply);
    } catch (e) { console.error(e); setHairAns("⚠️ Error fetching hair tips."); }
    finally { setLoading(false); }
  };

  const askSkinAi = async () => {
    try {
      setLoading(true);
      const reply = await askGemini(`Skin type is ${skinType}. Suggest a minimal AM/PM routine for Indian climate with product actives (generic). Keep it concise.`);
      setSkinAns(reply);
    } catch (e) { console.error(e); setSkinAns("⚠️ Error fetching skin routine."); }
    finally { setLoading(false); }
  };

  const askSugarAi = async () => {
    try {
      setLoading(true);
      const reply = await askGemini(`I ate: ${food}. Estimate post-meal blood sugar impact for a non-diabetic adult, add quick mitigation tips.`);
      setSugarAns(reply);
      setSugarReading(110 + Math.floor(Math.random() * 25));
    } catch (e) { console.error(e); setSugarAns("⚠️ Error fetching sugar estimate."); }
    finally { setLoading(false); }
  };

  const askExerciseAi = async () => {
    try {
      setLoading(true);
      const reply = await askGemini(`${exerciseMode === "home" ? "Create a 3-day home bodyweight plan." : "Create a 3-day gym push/pull/legs plan."} Include sets/reps and warm-up. Keep concise.`);
      setExerciseAns(reply);
    } catch (e) { console.error(e); setExerciseAns("⚠️ Error fetching plan."); }
    finally { setLoading(false); }
  };

  // Chatbot (floating) - improved UI
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState([]); // {role: 'user'|'ai', text}
  const chatBoxRef = useRef(null);
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMsgs, chatOpen]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMsgs, { role: "user", text: chatInput }];
    setChatMsgs(newMsgs);
    setChatInput("");
    try {
      setLoading(true);
      const reply = await askGemini(chatInput, newMsgs);
      setChatMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch (e) {
      setChatMsgs((m) => [...m, { role: "ai", text: "⚠️ Error talking to AI" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-200 via-violet-200 to-sky-200">
 

      {/* Main area */}
      <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Navbar */}
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">AI Wellness Dashboard</h2>
          {/* <button className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-white">
            <LogIn size={16} /> Login
          </button> */}
        </header>

        {/* Summary Pills */}
        <div className="mb-6 flex flex-wrap gap-2 text-gray-700">
          <span className="rounded-xl bg-white/70 px-3 py-1">Mood: {moodEmoji}</span>
          <span className="rounded-xl bg-white/70 px-3 py-1">Sleep: {sleepHours}h</span>
          <span className="rounded-xl bg-white/70 px-3 py-1">Steps: {stepsToday.toLocaleString()}</span>
          <span className="rounded-xl bg-white/70 px-3 py-1">Sugar: {sugarReading} mg/dL</span>
        </div>

        {/* Cards grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashCard icon={<Smile />} title="Mood" onClick={() => setOpenMood(true)}>
            <p className="text-gray-700">Current mood: <span className="text-2xl">{moodEmoji}</span></p>
            <p className="text-gray-500">Tap to update from 15 emojis</p>
          </DashCard>

          <DashCard icon={<Moon />} title="Sleep" onClick={() => setOpenSleep(true)}>
            <p className="text-gray-700">Last night: <b>{sleepHours} hr</b></p>
            <p className="text-gray-500">Deep/Light split + AI feedback</p>
          </DashCard>

          <DashCard icon={<Droplet />} title="Hair Tips" onClick={() => setOpenHair(true)}>
            <p className="text-gray-700">Personalized routine via AI</p>
            <p className="text-gray-500">Texture • Volume • Breakage</p>
          </DashCard>

          <DashCard icon={<Footprints />} title="Steps" onClick={() => setOpenSteps(true)}>
            <p className="text-gray-700">Today: <b>{stepsToday.toLocaleString()}</b></p>
            <p className="text-gray-500">Enter km/m → instant steps</p>
          </DashCard>

          <DashCard icon={<Droplet />} title="Skin Care" onClick={() => setOpenSkin(true)}>
            <p className="text-gray-700">AI routine for Dry • Oily • Combo</p>
            <p className="text-gray-500">SPF • Actives • Moisturizer</p>
          </DashCard>

          <DashCard icon={<HeartPulse />} title="Blood Sugar" onClick={() => setOpenSugar(true)}>
            <p className="text-gray-700">Quick meal check</p>
            <p className="text-gray-500">Estimate & tips after meals</p>
          </DashCard>

          <DashCard icon={<Dumbbell />} title="Exercise / Gym" onClick={() => setOpenExercise(true)}>
            <p className="text-gray-700">Home vs Gym plans</p>
            <p className="text-gray-500">Smart beginner programs</p>
          </DashCard>

          <DashCard icon={<Timer />} title="Meditation" onClick={() => {}}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={medMinutes}
                onChange={(e) => setMedMinutes(e.target.value)}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                placeholder="min"
              />
              <button
                onClick={() => { const s = Number(medMinutes) * 60; if (s>0) { setMedLeft(s); setMedRunning(true);} }}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
              >Start</button>
              {medRunning && (
                <span className="rounded-xl bg-white/70 px-3 py-1 text-gray-800">
                  ⏳ {Math.floor(medLeft/60)}:{String(medLeft%60).padStart(2,'0')}
                </span>
              )}
            </div>
          </DashCard>

          {/* NEW: Date & Time Card */}
          <DashCard icon={<CalendarCheck />} title="Date & Time" onClick={() => {}}>
            <p className="text-gray-700">{now.toLocaleDateString()}</p>
            <p className="text-gray-500">{now.toLocaleTimeString()}</p>
          </DashCard>
        </section>
      </main>

      {/* Mood dialog */}
      <Modal open={openMood} onClose={() => setOpenMood(false)} title="How do you feel right now?">
        <div className="grid grid-cols-5 gap-3 text-2xl">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => saveMood(e)} className="rounded-xl bg-gray-100 p-2 hover:bg-gray-200">{e}</button>
          ))}
        </div>
        {loading && <p className="mt-3 text-sm text-gray-500">Asking AI…</p>}
      </Modal>

      {/* Sleep dialog */}
      <Modal open={openSleep} onClose={() => setOpenSleep(false)} title="How many hours did you sleep?">
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-28 rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. 7.5" />
          <button onClick={analyzeSleep} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Analyze</button>
        </div>
        {loading && <p className="mt-3 text-sm text-gray-500">Asking AI…</p>}
      </Modal>

      {/* Hair dialog */}
      <Modal open={openHair} onClose={() => setOpenHair(false)} title="Tell me about your hair">
        <div className="space-y-3">
          <input value={hairQ} onChange={(e) => setHairQ(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. Dry texture, low volume, hair fall" />
          <button onClick={askHairAi} className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Get AI Tip</button>
          {hairAns && <pre className="whitespace-pre-wrap rounded-lg bg-purple-50 p-3 text-purple-900">{hairAns}</pre>}
          {loading && <p className="text-sm text-gray-500">Asking AI…</p>}
        </div>
      </Modal>

      {/* Skin dialog */}
      <Modal open={openSkin} onClose={() => setOpenSkin(false)} title="What is your skin type?">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[{v:"dry",t:"Dry"},{v:"oily",t:"Oily"},{v:"combination",t:"Combination"}].map((opt) => (
              <button key={opt.v} onClick={() => setSkinType(opt.v)} className={`rounded-lg px-3 py-2 ${skinType===opt.v?"bg-indigo-600 text-white":"bg-gray-100 hover:bg-gray-200"}`}>{opt.t}</button>
            ))}
          </div>
          <button onClick={askSkinAi} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Get Routine</button>
          {skinAns && <pre className="whitespace-pre-wrap rounded-lg bg-indigo-50 p-3 text-indigo-900">{skinAns}</pre>}
          {loading && <p className="text-sm text-gray-500">Asking AI…</p>}
        </div>
      </Modal>

      {/* Steps dialog */}
      <Modal open={openSteps} onClose={() => setOpenSteps(false)} title="Enter your distance">
        <div className="flex flex-wrap items-center gap-2">
          <input type="number" value={dist} onChange={(e) => setDist(e.target.value)} className="w-36 rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. 3" />
          <select value={distUnit} onChange={(e) => setDistUnit(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-2">
            <option value="km">km</option>
            <option value="m">m</option>
          </select>
          <button onClick={calcStepsFromDistance} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">Calculate</button>
        </div>
        {calcSteps !== null && (
          <p className="mt-3 rounded-lg bg-green-50 p-3 text-green-900">≈ {calcSteps.toLocaleString()} steps</p>
        )}
        {loading && <p className="text-sm text-gray-500">Asking AI…</p>}
      </Modal>

      {/* Sugar dialog */}
      <Modal open={openSugar} onClose={() => setOpenSugar(false)} title="What did you eat?">
        <div className="space-y-3">
          <input value={food} onChange={(e) => setFood(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g. Coke + burger + fries" />
          <button onClick={askSugarAi} className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">Check Level</button>
          {sugarAns && <pre className="whitespace-pre-wrap rounded-lg bg-rose-50 p-3 text-rose-900">{sugarAns}</pre>}
          {loading && <p className="text-sm text-gray-500">Asking AI…</p>}
        </div>
      </Modal>

      {/* Exercise dialog */}
      <Modal open={openExercise} onClose={() => setOpenExercise(false)} title="Choose your mode">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[{v:"home",t:"Home"},{v:"gym",t:"Gym"}].map((opt) => (
              <button key={opt.v} onClick={() => setExerciseMode(opt.v)} className={`rounded-lg px-3 py-2 ${exerciseMode===opt.v?"bg-purple-600 text-white":"bg-gray-100 hover:bg-gray-200"}`}>{opt.t}</button>
            ))}
          </div>
          <button onClick={askExerciseAi} className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">Get Plan</button>
          {exerciseAns && <pre className="whitespace-pre-wrap rounded-lg bg-purple-50 p-3 text-purple-900">{exerciseAns}</pre>}
          {loading && <p className="text-sm text-gray-500">Asking AI…</p>}
        </div>
      </Modal>

      {/* Floating Chat Button */}
      <button onClick={() => setChatOpen((v) => !v)} className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-xl">
        <MessageCircle />
      </button>

      {/* Chatbox */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-[92vw] max-w-sm overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <span className="font-medium">AI Chat</span>
              <button className="text-sm text-white" onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div ref={chatBoxRef} className="max-h-72 space-y-2 overflow-y-auto p-3 text-sm bg-gradient-to-b from-indigo-50 to-purple-50">
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl p-2 ${m.role === "user" ? "bg-indigo-500 text-white" : "bg-white text-gray-800 shadow"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t p-2 bg-white/60 backdrop-blur">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" placeholder="Ask anything…" />
              <button onClick={sendChat} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome overlay */}
      {showWelcome && <WelcomeOverlay onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-gray-800 transition hover:bg-white/60 ${active ? "bg-white/70" : ""}`}>{icon}<span>{label}</span></div>
  );
}

function DashCard({ icon, title, children, onClick }) {
  return (
    <motion.button onClick={onClick} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-5 text-left text-gray-800 shadow-lg backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/50 blur-2xl transition-all group-hover:scale-125" />
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/80 text-indigo-700">{icon}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </motion.button>
  );
}




