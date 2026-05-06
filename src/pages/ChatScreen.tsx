import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Menu, Phone } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useFeedback } from "@/hooks/useFeedback";
import GradientBackground from "@/components/GradientBackground";
import ChatMessageList from "@/components/ChatMessageList";
import ChatInputBar from "@/components/ChatInputBar";
import ConversationSidebar from "@/components/ConversationSidebar";
import TypingIndicator from "@/components/TypingIndicator";
import LiveVoiceMode from "@/components/LiveVoiceMode";
import { ChatSkeleton } from "@/components/SkeletonLoader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import aexoMascot from "@/assets/aexo-mascot.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: Date;
  isGeneratingImage?: boolean;
}

const quickPrompts = [
  "Generate a startup idea",
  "Explain quantum computing simply",
  "Create a surreal landscape image",
  "Write a poem about AI",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();
  const { playSendSound, playReceiveSound, haptic } = useFeedback();
  const mode = (location.state as any)?.mode || "chat";
  const { conversations, currentConvoId, createConversation, saveMessage, loadMessages, loadingHistory, setCurrentConvoId, deleteConversation, togglePin } = useChatHistory(mode);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string): Promise<string> => {
    if (!text.trim() || isTyping) return "";

    haptic("medium");
    playSendSound();

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // For image mode, add a placeholder with blurry skeleton
    if (mode === "image") {
      const placeholderId = (Date.now() + 0.5).toString();
      setMessages((prev) => [...prev, {
        id: placeholderId,
        role: "assistant",
        content: "Creating your image...",
        timestamp: new Date(),
        isGeneratingImage: true,
      }]);
    }

    try {
      let convoId = currentConvoId;
      if (!convoId) {
        convoId = await createConversation(text);
      }

      if (convoId) await saveMessage(convoId, "user", text);

      const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: allMessages, mode },
      });

      if (error) throw error;

      const responseText = data.content || "I couldn't generate a response.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        images: data.images,
        timestamp: new Date(),
      };

      // Remove placeholder and add real message
      setMessages((prev) => {
        const filtered = prev.filter(m => !m.isGeneratingImage);
        return [...filtered, assistantMsg];
      });
      playReceiveSound();
      haptic("light");
      if (convoId) await saveMessage(convoId, "assistant", assistantMsg.content, assistantMsg.images);
      return responseText;
    } catch (err: any) {
      // Remove placeholder on error
      setMessages((prev) => prev.filter(m => !m.isGeneratingImage));
      toast.error("Failed to get response. Please try again.");
      console.error(err);
      throw err;
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    const dbMessages = await loadMessages(id);
    setMessages(
      dbMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        images: m.images?.length ? m.images : undefined,
        timestamp: new Date(m.created_at),
      }))
    );
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConvoId(null);
    setSidebarOpen(false);
  };

  const firstName = profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <GradientBackground>
      <div className="h-[100dvh] flex flex-col max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl">
        <ConversationSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          currentId={currentConvoId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={deleteConversation}
          onPin={togglePin}
        />

        {/* Live Voice Mode */}
        <AnimatePresence>
          {liveMode && (
            <LiveVoiceMode onClose={() => setLiveMode(false)} onSend={sendMessage} />
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-1 sm:pb-2 flex-shrink-0"
        >
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full glass btn-drop flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <img src={aexoMascot} alt="Aexo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-foreground text-sm sm:text-base font-display">
              {mode === "image" ? "Image Studio" : mode === "idea" ? "Idea Lab" : "Aexo Chat"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLiveMode(true)} className="w-9 h-9 rounded-full glass btn-drop flex items-center justify-center">
              <Phone size={16} className="text-primary" />
            </button>
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-full glass btn-drop flex items-center justify-center">
              <Menu size={18} className="text-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 custom-scroll">
          {loadingHistory && <ChatSkeleton />}

          {!loadingHistory && messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4">
              <motion.img
                src={aexoMascot}
                alt="Aexo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-muted-foreground text-sm text-center">Start a conversation with Aexo</p>
              <div className="flex flex-wrap gap-2 justify-center mt-1 sm:mt-2 px-2">
                {quickPrompts.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)} className="px-3 py-2 rounded-2xl glass text-xs text-foreground hover:scale-105 transition-transform">
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <ChatMessageList messages={messages} firstName={firstName} avatarUrl={profile?.avatar_url} onRegenerate={sendMessage} />

          {isTyping && !messages.some(m => m.isGeneratingImage) && <TypingIndicator />}
        </div>

        <ChatInputBar onSend={sendMessage} disabled={isTyping} />
      </div>
    </GradientBackground>
  );
}
