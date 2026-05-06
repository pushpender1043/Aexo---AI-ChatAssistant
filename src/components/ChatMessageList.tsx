import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, RefreshCw, Copy, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
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

interface Props {
  messages: Message[];
  firstName: string;
  avatarUrl?: string | null;
  onRegenerate: (content: string) => void;
}

export default function ChatMessageList({ messages, firstName, avatarUrl, onRegenerate }: Props) {
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <AnimatePresence>
      {messages.map((msg, idx) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
        >
          {msg.role === "assistant" && (
            <img src={aexoMascot} alt="Aexo" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-contain" />
          )}
          <div className={`min-w-0 max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "glass rounded-3xl rounded-tr-lg px-4 py-3" : ""}`}>
            {msg.role === "user" ? (
              <p className="text-sm text-foreground break-words">{msg.content}</p>
            ) : (
              <div className="glass rounded-3xl rounded-tl-lg px-4 py-3 overflow-hidden">
                <div className="text-sm text-foreground prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden
                  prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:rounded-xl prose-pre:bg-muted/80 prose-pre:p-3 prose-pre:text-xs
                  prose-code:break-all prose-code:text-xs prose-code:bg-muted/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                  prose-p:leading-relaxed prose-headings:text-foreground prose-strong:text-foreground
                  prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                  [&_table]:overflow-x-auto [&_table]:block [&_table]:max-w-full
                  [&_img]:rounded-xl [&_img]:max-w-full">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Blurry skeleton while image is generating */}
                {msg.isGeneratingImage && (
                  <div className="mt-3 rounded-2xl overflow-hidden">
                    <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 animate-pulse rounded-2xl">
                      <div className="absolute inset-0 backdrop-blur-xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
                          />
                          <span className="text-xs text-muted-foreground">Generating image...</span>
                        </div>
                      </div>
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}

                {msg.images && msg.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {msg.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="AI generated" className="rounded-2xl w-full max-h-64 object-contain" loading="lazy" />
                        <a
                          href={img}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={14} className="text-foreground" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                  <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
                    <ThumbsUp size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      const prevUser = messages[idx - 1];
                      if (prevUser) onRegenerate(prevUser.content);
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <RefreshCw size={14} className="text-muted-foreground" />
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => copyMessage(msg.content)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                    <Copy size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
            <p className={`text-[10px] text-muted-foreground mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {msg.role === "user" && (
            avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full flex-shrink-0 mt-1 object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 mt-1 text-[10px] text-primary-foreground font-bold">
                {firstName[0]?.toUpperCase()}
              </div>
            )
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
