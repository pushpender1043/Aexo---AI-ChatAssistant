import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Plus, Image, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useFeedback } from "@/hooks/useFeedback";

interface Attachment {
  file: File;
  preview?: string;
  type: "image" | "pdf";
}

interface Props {
  onSend: (text: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

export default function ChatInputBar({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const { isListening, transcript, startListening, stopListening, supported } = useVoiceInput();
  const { playTypingSound, haptic } = useFeedback();
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!isListening && transcript) {
      onSend(transcript);
      setInput("");
    }
  }, [isListening]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    playTypingSound();
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    haptic("medium");
    onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
  };

  const handleFileSelect = (files: FileList | null, type: "image" | "pdf") => {
    if (!files) return;
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const att: Attachment = { file, type };
      if (type === "image") {
        att.preview = URL.createObjectURL(file);
      }
      newAttachments.push(att);
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
    setShowMenu(false);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const copy = [...prev];
      if (copy[idx].preview) URL.revokeObjectURL(copy[idx].preview!);
      copy.splice(idx, 1);
      return copy;
    });
  };

  return (
    <div className="px-3 sm:px-4 pb-2 sm:pb-3 pt-1 flex-shrink-0">
      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-2 overflow-x-auto pb-1 custom-scroll"
          >
            {attachments.map((att, i) => (
              <div key={i} className="relative flex-shrink-0">
                {att.type === "image" && att.preview ? (
                  <img src={att.preview} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover glass" />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl glass flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-3xl flex items-center gap-2 px-3 py-2.5 sm:py-3 relative">
        {/* Plus menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`w-8 h-8 rounded-full bg-muted btn-drop flex items-center justify-center flex-shrink-0 transition-transform ${showMenu ? "rotate-45" : ""}`}
          >
            <Plus size={16} className="text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-12 left-0 glass rounded-2xl p-2 min-w-[130px] z-10 space-y-1"
              >
                <button
                  onClick={() => imageRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Image size={15} className="text-primary" />
                  Image
                </button>
                <button
                  onClick={() => pdfRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <FileText size={15} className="text-accent" />
                  PDF
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e.target.files, "image")} />
        <input ref={pdfRef} type="file" accept=".pdf" multiple className="hidden" onChange={(e) => handleFileSelect(e.target.files, "pdf")} />

        <input
          value={input}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isListening ? "Listening..." : "Write your message..."}
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!input.trim() && attachments.length === 0)}
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 flex-shrink-0"
        >
          <Send size={18} />
        </button>
        {supported && (
          <button
            onClick={() => {
              haptic("medium");
              isListening ? stopListening() : startListening();
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full btn-drop flex items-center justify-center flex-shrink-0 ${
              isListening ? "bg-destructive animate-pulse" : "gradient-bg"
            }`}
          >
            {isListening ? <MicOff size={16} className="text-primary-foreground" /> : <Mic size={16} className="text-primary-foreground" />}
          </button>
        )}
      </div>
    </div>
  );
}
