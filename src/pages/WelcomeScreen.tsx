import { motion } from "framer-motion";
import { Mic, MessageSquare, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GradientBackground from "@/components/GradientBackground";
import AIAvatar from "@/components/AIAvatar";
import aexoMascot from "@/assets/aexo-mascot.png";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto lg:max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 self-start"
        >
          <img src={aexoMascot} alt="Aexo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-extrabold text-foreground tracking-tight font-display">Aexo</span>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <AIAvatar size="lg" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight font-display">
              Your <span className="gradient-text">AI Sidekick</span>.
              <br />
              Always On. Always Smart.
            </h1>
          </motion.div>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-6"
        >
          <button
            onClick={() => navigate("/auth")}
            className="w-12 h-12 rounded-full glass btn-drop flex items-center justify-center hover:scale-110 transition-transform"
          >
            <MessageSquare size={20} className="text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="w-16 h-16 rounded-full gradient-bg btn-drop flex items-center justify-center glow-primary hover:scale-105 transition-transform"
          >
            <Mic size={28} className="text-primary-foreground" />
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="w-12 h-12 rounded-full glass btn-drop flex items-center justify-center hover:scale-110 transition-transform"
          >
            <MoreHorizontal size={20} className="text-muted-foreground" />
          </button>
        </motion.div>
      </div>
    </GradientBackground>
  );
}
