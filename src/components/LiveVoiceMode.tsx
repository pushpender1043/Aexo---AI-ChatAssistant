import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Settings2, Volume2, Gauge, Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import aexoMascot from "@/assets/aexo-mascot.png";

interface Props {
  onClose: () => void;
  onSend: (text: string) => Promise<string>;
}

export interface LiveVoiceModeHandle {
  speakResponse: (text: string) => void;
}

const STORAGE_KEY = "aexo_voice_settings";

const LiveVoiceMode = forwardRef<LiveVoiceModeHandle, Props>(({ onClose, onSend }, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  })();
  const [rate, setRate] = useState<number>(saved.rate ?? 1);
  const [pitch, setPitch] = useState<number>(saved.pitch ?? 1.05);
  const [volume, setVolume] = useState<number>(saved.volume ?? 0.95);
  const [voiceURI, setVoiceURI] = useState<string | null>(saved.voiceURI ?? null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const isListeningRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate, pitch, volume, voiceURI }));
  }, [rate, pitch, volume, voiceURI]);

  // Load voices
  useEffect(() => {
    const load = () => {
      const v = synthRef.current.getVoices().filter(v => v.lang.startsWith("en"));
      setVoices(v);
      if (!voiceURI && v.length) {
        const preferred = v.find(x =>
          x.name.includes("Google UK English Female") ||
          x.name.includes("Samantha") ||
          x.name.includes("Google US English")
        ) || v[0];
        setVoiceURI(preferred.voiceURI);
      }
    };
    load();
    synthRef.current.addEventListener?.("voiceschanged", load);
    return () => synthRef.current.removeEventListener?.("voiceschanged", load);
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const clean = text
      .replace(/```[\s\S]*?```/g, "code block")
      .replace(/[*_~`#>\[\]()!]/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voice = voices.find(v => v.voiceURI === voiceURI);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isListeningRef.current) {
        try { recognitionRef.current?.start(); } catch {}
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    try { recognitionRef.current?.stop(); } catch {}
    synthRef.current.speak(utterance);
  }, [rate, pitch, volume, voiceURI, voices]);

  useImperativeHandle(ref, () => ({
    speakResponse: (text: string) => {
      setAiResponse(text);
      setIsThinking(false);
      speak(text);
    },
  }));

  const handleFinalResult = useCallback(async (finalText: string) => {
    if (!finalText.trim()) return;
    setIsThinking(true);
    setAiResponse("");
    try { recognitionRef.current?.stop(); } catch {}

    try {
      const response = await onSend(finalText);
      setAiResponse(response);
      setIsThinking(false);
      speak(response);
    } catch {
      const err = "Sorry, I couldn't get a response.";
      setAiResponse(err);
      setIsThinking(false);
      speak(err);
    }
  }, [onSend, speak]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          handleFinalResult(t.trim());
        } else {
          interim += t;
        }
      }
      if (interim) setTranscript(interim);
    };

    recognition.onend = () => {
      if (isListeningRef.current && !synthRef.current.speaking) {
        try { recognition.start(); } catch {}
      }
    };
    recognition.onerror = (e: any) => {
      if (e.error !== "aborted" && e.error !== "no-speech") {
        console.warn("Speech recognition error:", e.error);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;
    } catch {}
  }, [SpeechRecognition, handleFinalResult]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    startListening();
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Test voice with current settings
  const testVoice = () => speak("Hi, I'm Aexo. This is how I sound right now.");

  const barCount = 14;
  const status = isThinking ? "Thinking..." : isSpeaking ? "Speaking" : isListening ? "Listening" : "Tap mic to start";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "hsl(var(--background) / 0.96)", backdropFilter: "blur(30px)" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening || isSpeaking ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-sm font-medium text-foreground font-display">Live with Aexo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`w-10 h-10 rounded-full glass btn-drop flex items-center justify-center ${showSettings ? "bg-primary/20" : ""}`}
          >
            <Settings2 size={18} className="text-foreground" />
          </button>
          <button
            onClick={() => { stopListening(); onClose(); }}
            className="w-10 h-10 rounded-full glass btn-drop flex items-center justify-center"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 sm:gap-8 overflow-y-auto custom-scroll py-4">
        {/* Mascot with glow */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            animate={{
              boxShadow: isSpeaking
                ? ["0 0 60px hsl(var(--primary) / 0.5)", "0 0 120px hsl(var(--primary) / 0.75)", "0 0 60px hsl(var(--primary) / 0.5)"]
                : isListening
                ? ["0 0 40px hsl(var(--primary) / 0.4)", "0 0 80px hsl(var(--primary) / 0.6)", "0 0 40px hsl(var(--primary) / 0.4)"]
                : "0 0 25px hsl(var(--primary) / 0.25)",
              scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: isSpeaking ? 0.7 : 1.6, repeat: Infinity }}
            style={{ width: 160, height: 160 }}
          />
          <motion.img
            src={aexoMascot}
            alt="Aexo"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain relative z-10 drop-shadow-2xl"
            animate={
              isSpeaking ? { scale: [1, 1.08, 1] }
              : isThinking ? { rotate: [0, 6, -6, 0] }
              : { y: [0, -8, 0] }
            }
            transition={{ duration: isSpeaking ? 0.4 : isThinking ? 1 : 2.4, repeat: Infinity }}
          />
        </div>

        {/* Visualizer */}
        <div className="flex items-end justify-center gap-1.5 h-20">
          {Array.from({ length: barCount }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-1.5 sm:w-2 rounded-full ${isSpeaking ? "bg-accent" : "bg-primary"}`}
              animate={{
                height: isSpeaking
                  ? [12, 40 + Math.random() * 35, 12]
                  : isListening
                  ? [10, 25 + Math.random() * 35, 10]
                  : [4, 8, 4],
                opacity: (isSpeaking || isListening) ? [0.6, 1, 0.6] : 0.4,
              }}
              transition={{
                duration: isSpeaking ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.04,
              }}
            />
          ))}
        </div>

        {/* Status pill */}
        <div className="glass rounded-full px-5 py-2">
          <p className="text-sm font-medium text-foreground">{status}</p>
        </div>

        {/* Transcript area - fixed height to prevent jumping */}
        <div className="w-full max-w-md min-h-[80px] flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {transcript && !isThinking && !isSpeaking && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl px-4 py-2.5 max-w-full"
              >
                <p className="text-foreground text-sm text-center break-words line-clamp-2">
                  🎤 "{transcript}"
                </p>
              </motion.div>
            )}
            {aiResponse && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl px-4 py-2.5 max-w-full"
              >
                <p className="text-muted-foreground text-xs text-center break-words line-clamp-3">
                  💬 {aiResponse}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 sm:mx-6 mb-4 glass-strong rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold text-foreground">Voice Settings</h3>
              <button onClick={testVoice} className="text-xs px-3 py-1.5 rounded-full gradient-bg text-primary-foreground btn-drop">
                Test
              </button>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Gauge size={13} className="text-primary" /> Speed
                </span>
                <span className="text-foreground font-medium">{rate.toFixed(2)}x</span>
              </div>
              <Slider value={[rate]} min={0.5} max={2} step={0.05} onValueChange={(v) => setRate(v[0])} />
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Music2 size={13} className="text-primary" /> Pitch
                </span>
                <span className="text-foreground font-medium">{pitch.toFixed(2)}</span>
              </div>
              <Slider value={[pitch]} min={0.5} max={2} step={0.05} onValueChange={(v) => setPitch(v[0])} />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Volume2 size={13} className="text-primary" /> Volume
                </span>
                <span className="text-foreground font-medium">{Math.round(volume * 100)}%</span>
              </div>
              <Slider value={[volume]} min={0} max={1} step={0.05} onValueChange={(v) => setVolume(v[0])} />
            </div>

            {/* Voice picker */}
            {voices.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Voice</span>
                <select
                  value={voiceURI ?? ""}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  className="w-full glass rounded-xl px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {voices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI} className="bg-background">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic control */}
      <div className="flex items-center justify-center pb-8 sm:pb-10 pt-2 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => isListening ? stopListening() : startListening()}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full btn-drop flex items-center justify-center ${
            isListening ? "bg-destructive" : "gradient-bg glow-primary"
          }`}
        >
          {isListening ? (
            <MicOff size={32} className="text-primary-foreground" />
          ) : (
            <Mic size={32} className="text-primary-foreground" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
});

LiveVoiceMode.displayName = "LiveVoiceMode";
export default LiveVoiceMode;
