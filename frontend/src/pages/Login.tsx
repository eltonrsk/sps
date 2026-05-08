import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  ArrowLeft,
} from "lucide-react";

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("parent");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signUp(
        email,
        password,
        fullName,
        role,
        phoneNumber || undefined
      );

      setEmail("");
      setPassword("");
      setFullName("");
      setPhoneNumber("");
      setRole("parent");

      setError("Account created successfully! Please sign in.");
      setIsLogin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: "url('/image/school1.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/80 to-slate-900/90 backdrop-blur-[4px]" />

      {/* Glow Effects */}
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="absolute bottom-[-140px] right-[-100px] w-[350px] h-[350px] bg-sky-400/20 rounded-full blur-3xl"
      />

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.06, x: -3 }}
        whileTap={{ scale: 0.96 }}
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-20 w-full max-w-md"
      >
        <div className="bg-white/10 border border-white/10 backdrop-blur-3xl rounded-[34px] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          {/* Header */}
          <div className="flex flex-col items-center mb-5">
            <motion.div
              whileHover={{
                rotate: 360,
                scale: 1.08,
              }}
              transition={{ duration: 0.8 }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-4"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-black text-white">
              Student Pickup
            </h1>

            <p className="text-slate-300 text-sm mt-1 text-center">
              Smart QR Security Verification
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-4 p-3 rounded-2xl text-sm border ${
                  error.includes("successfully")
                    ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/20"
                    : "bg-red-500/10 text-red-200 border-red-400/20"
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <div className="relative flex bg-white/5 p-1 rounded-2xl mb-5 border border-white/10">
            <motion.div
              animate={{
                x: isLogin ? 0 : "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl"
            />

            <button
              onClick={() => setIsLogin(true)}
              className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-colors ${
                isLogin ? "text-white" : "text-slate-300"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`relative z-10 flex-1 py-3 rounded-xl font-semibold transition-colors ${
                !isLogin ? "text-white" : "text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignUp}
                className="space-y-3"
              >
                {/* Instead of scrollbar -> compact responsive layout */}

                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Elton Ricardo"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+255655712086"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Role
                  </label>

                  <div className="relative">
                    <Shield className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 z-10" />

                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                    >
                      <option className="bg-slate-900" value="parent">
                        Parent
                      </option>

                      <option className="bg-slate-900" value="teacher">
                        Teacher
                      </option>

                      <option className="bg-slate-900" value="security">
                        Security Staff
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-2 font-medium">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-slate-300 text-sm">
            © EltonRSK • Smart Student Security System
          </p>
        </div>
      </motion.div>
    </div>
  );
}