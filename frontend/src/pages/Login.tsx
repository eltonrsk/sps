import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("parent");

  // Auto-dismiss notification after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: unknown, isLogin: boolean): string => {
    const message = error instanceof Error ? error.message : String(error);
    const lowerMessage = message.toLowerCase();

    // Email already exists
    if (lowerMessage.includes('email') && (lowerMessage.includes('already') || lowerMessage.includes('exists') || lowerMessage.includes('taken'))) {
      return 'This email is already registered. Please use a different email or try logging in.';
    }

    // Invalid credentials for login
    if (isLogin && (lowerMessage.includes('invalid') || lowerMessage.includes('credential') || lowerMessage.includes('password') || lowerMessage.includes('email'))) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    // Password too weak
    if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short') || lowerMessage.includes('minimum'))) {
      return 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
    }

    // Email format invalid
    if (lowerMessage.includes('email') && (lowerMessage.includes('invalid') || lowerMessage.includes('format'))) {
      return 'Please enter a valid email address.';
    }

    // Network/server errors
    if (lowerMessage.includes('network') || lowerMessage.includes('server') || lowerMessage.includes('connection')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Default to the original message if no specific pattern matches
    return message;
  };

  // Sanitize input to prevent XSS attacks
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[&<>"']/g, (char) => {
        const escapeMap: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return escapeMap[char];
      })
      .trim();
  };

  // Validation functions with regex
  const validateEmail = (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return { valid: false, error: 'Email is required' };
    if (!emailRegex.test(email)) return { valid: false, error: 'Please enter a valid email address' };
    if (email.length > 255) return { valid: false, error: 'Email is too long (max 255 characters)' };
    return { valid: true };
  };

  const validatePassword = (password: string): { valid: boolean; error?: string } => {
    if (!password) return { valid: false, error: 'Password is required' };
    if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
    if (password.length > 128) return { valid: false, error: 'Password is too long (max 128 characters)' };
    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      return { valid: false, error: 'Password must contain both letters and numbers' };
    }
    return { valid: true };
  };

  const validateFullName = (name: string): { valid: boolean; error?: string } => {
    if (!name) return { valid: false, error: 'Full name is required' };
    if (name.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 100) return { valid: false, error: 'Name is too long (max 100 characters)' };
    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    return { valid: true };
  };

  const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
    if (!phone) return { valid: true }; // Optional field
    // Allow international phone numbers with +, digits, spaces, hyphens, and parentheses
    const phoneRegex = /^\+?[\d\s()-]{10,20}$/;
    if (!phoneRegex.test(phone)) return { valid: false, error: 'Please enter a valid phone number' };
    return { valid: true };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setNotification(null);

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.valid) {
      setNotification({ type: 'error', message: emailValidation.error || 'Invalid email' });
      return;
    }

    if (!passwordValidation.valid) {
      setNotification({ type: 'error', message: passwordValidation.error || 'Invalid password' });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = password; // Password should not be sanitized as it may contain special chars

    setLoading(true);

    try {
      await signIn(sanitizedEmail, sanitizedPassword);
      setNotification({ type: 'success', message: 'Login successful! Welcome back.' });
    } catch (err) {
      const errorMsg = getErrorMessage(err, true);
      setNotification({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setNotification(null);

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const nameValidation = validateFullName(fullName);
    const phoneValidation = validatePhoneNumber(phoneNumber);

    if (!emailValidation.valid) {
      setNotification({ type: 'error', message: emailValidation.error || 'Invalid email' });
      return;
    }

    if (!passwordValidation.valid) {
      setNotification({ type: 'error', message: passwordValidation.error || 'Invalid password' });
      return;
    }

    if (!nameValidation.valid) {
      setNotification({ type: 'error', message: nameValidation.error || 'Invalid name' });
      return;
    }

    if (!phoneValidation.valid) {
      setNotification({ type: 'error', message: phoneValidation.error || 'Invalid phone number' });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedPhoneNumber = phoneNumber ? sanitizeInput(phoneNumber) : undefined;
    const sanitizedPassword = password; // Password should not be sanitized as it may contain special chars

    setLoading(true);

    try {
      await signUp(
        sanitizedEmail,
        sanitizedPassword,
        sanitizedFullName,
        role,
        sanitizedPhoneNumber
      );

      setEmail("");
      setPassword("");
      setFullName("");
      setPhoneNumber("");
      setRole("parent");

      setNotification({ type: 'success', message: 'Account created successfully! Please sign in.' });
      setIsLogin(true);
    } catch (err) {
      const errorMsg = getErrorMessage(err, false);
      setNotification({ type: 'error', message: errorMsg });
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

          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-4 p-4 rounded-2xl text-sm border flex items-start gap-3 relative z-50 ${
                  notification.type === 'success'
                    ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/40"
                    : "bg-red-500/30 text-red-100 border-red-400/40"
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1 font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="flex-shrink-0 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
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

                {/* <div>
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
                </div> */}

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