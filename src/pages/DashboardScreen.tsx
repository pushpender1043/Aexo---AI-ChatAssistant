import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Lightbulb, Search, ImageIcon, Send, Mic, Plus, Zap, Brain, Palette, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import GradientBackground from "@/components/GradientBackground";
import ConversationSidebar from "@/components/ConversationSidebar";
import { useChatHistory } from "@/hooks/useChatHistory";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import aexoMascot from "@/assets/aexo-mascot.png";

const features = [
  { icon: MessageSquare, title: "Chat Assistant", desc: "Chat smarter with AI.", color: "from-primary to-accent", mode: "chat" },
  { icon: Lightbulb, title: "Idea Generator", desc: "Fresh ideas instantly.", color: "from-accent to-primary", mode: "idea" },
  { icon: Search, title: "Deep Search", desc: "AI-powered search.", color: "from-primary to-primary", mode: "chat" },
  { icon: ImageIcon, title: "Image Studio", desc: "Create visuals from text.", color: "from-accent to-accent", mode: "image" },
];

const suggestions = [
  { icon: Search, label: "Deep Search" },
  { icon: Lightbulb, label: "Idea Boost" },
  { icon: Palette, label: "AI Image" },
  { icon: Brain, label: "Explain" },
  { icon: Zap, label: "Quick Task" },
];

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { conversations, deleteConversation, togglePin } = useChatHistory("chat");

  if (loading) {
    return (
      <GradientBackground>
        <div className="min-h-[100dvh] max-w-md mx-auto lg:max-w-2xl">
          <DashboardSkeleton />
        </div>
      </GradientBackground>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0];

  const handleSelectConversation = (id: string) => {
    setSidebarOpen(false);
    navigate("/chat", { state: { convoId: id } });
  };

  return (
    <GradientBackground>
      <div className="min-h-[100dvh] flex flex-col max-w-md mx-auto pb-20 sm:pb-24 lg:max-w-2xl xl:max-w-3xl">
        <ConversationSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          currentId={null}
          onSelect={handleSelectConversation}
          onNew={() => { setSidebarOpen(false); navigate("/chat"); }}
          onDelete={deleteConversation}
          onPin={togglePin}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-1"
        >
          <div className="flex items-center gap-2">
            <img src={aexoMascot} alt="Aexo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-extrabold text-foreground tracking-tight font-display">Aexo</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass btn-drop flex items-center justify-center"
            >
              <History size={17} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-bg btn-drop flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                firstName[0]?.toUpperCase()
              )}
            </button>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 sm:px-6 mt-3 sm:mt-4"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl leading-tight text-foreground font-display">
            Hey {firstName}, <span className="font-extrabold gradient-text">What's the First Win Today?</span>
          </h1>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-6 px-4 sm:px-6"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 custom-scroll">
            {features.map((f, i) => (
              <motion.button
                key={f.title}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate("/chat", { state: { mode: f.mode } })}
                className="min-w-[140px] sm:min-w-[170px] glass rounded-3xl p-3.5 sm:p-4 text-left hover:scale-[1.02] transition-transform"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br ${f.color} btn-drop flex items-center justify-center mb-2.5`}>
                  <f.icon size={18} className="text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-sm">{f.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4 sm:px-6 mt-4 sm:mt-6"
        >
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => navigate("/chat")}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full glass text-xs sm:text-sm text-foreground hover:scale-105 transition-transform btn-drop"
              >
                <s.icon size={13} className="text-primary" />
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Floating chat button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-20 lg:right-[calc(50%-20rem)]"
        >
          <button
            onClick={() => navigate("/chat")}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-bg btn-drop flex items-center justify-center glow-primary"
          >
            <MessageSquare size={22} className="text-primary-foreground" />
          </button>
        </motion.div>

        {/* Bottom input bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="fixed bottom-0 left-0 right-0 z-10"
        >
          <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl px-3 sm:px-4 pb-2 sm:pb-4 pt-1">
            <div className="glass rounded-3xl flex items-center gap-2 px-3 py-2.5 sm:py-3">
              <button className="w-8 h-8 rounded-full bg-muted btn-drop flex items-center justify-center flex-shrink-0">
                <Plus size={16} className="text-muted-foreground" />
              </button>
              <input
                placeholder="Write your message..."
                onFocus={() => navigate("/chat")}
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                <Send size={18} />
              </button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-bg btn-drop flex items-center justify-center flex-shrink-0">
                <Mic size={16} className="text-primary-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </GradientBackground>
  );
}
