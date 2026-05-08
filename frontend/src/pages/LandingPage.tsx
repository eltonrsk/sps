import { motion } from "framer-motion";
import {
  QrCode,
  Bell,
  ArrowRight,
  Users,
  Shield,
} from "lucide-react";
import type { FC } from "react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

export const LandingPage: FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <QrCode className="w-7 h-7" />,
      title: "QR Code Generation",
      description:
        "Generate secure QR codes for student pickup authorization",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Security Verification",
      description:
        "Guards verify parent identity through secure scanning",
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Guardian Management",
      description:
        "Add up to 2 backup guardians for emergencies",
    },
    {
      icon: <Bell className="w-7 h-7" />,
      title: "Instant Notifications",
      description:
        "Real-time alerts for parents and administrators",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8 }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image/school1.png')",
        }}
      />

      {/* Dark Premium Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-blue-950/70 backdrop-blur-[2px]" />

      {/* Animated Glow */}
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{
                  rotate: 360,
                  scale: 1.08,
                }}
                transition={{ duration: 0.8 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-2xl shadow-blue-500/40"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-wide">
                  SPS
                </h1>
                <p className="text-sm text-blue-100 -mt-1">
                  Student Pickup System
                </p>
              </div>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-xl px-5 py-3 rounded-full text-white shadow-xl"
            >
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-medium text-sm">
                Secure & Trusted Platform
              </span>
            </motion.div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-xl px-5 py-2 rounded-full text-white text-sm font-medium mb-8"
              >
                <span className="text-yellow-300">✨</span>
                Smart School Security Solution
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-black text-white leading-tight"
              >
                Safe Student Pickup
                <br />

                <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Made Beautifully Smart
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mt-8 leading-relaxed"
              >
                A modern QR-powered verification system designed to keep
                students safe and parents confident through secure guardian
                authorization and real-time protection.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12"
              >
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    y: -3,
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onGetStarted}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-lg font-semibold px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-300"
                >
                  Get Started

                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                    }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="px-10 py-5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Features */}
        <section className="relative z-20 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 50,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                  }}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                  }}
                  className="group relative overflow-hidden bg-white/10 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-500"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <motion.div
                      whileHover={{
                        rotate: 8,
                        scale: 1.1,
                      }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white mb-5 shadow-lg"
                    >
                      {feature.icon}
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-slate-300 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-20 text-center pb-6"
        >
          <p className="text-slate-300 text-sm md:text-base">
            Keeping students safe, one pickup at a time ❤️
          </p>
        </motion.footer>
      </div>
    </div>
  );
};