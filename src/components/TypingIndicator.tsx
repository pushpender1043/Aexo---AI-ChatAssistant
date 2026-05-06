import { motion } from "framer-motion";
import aexoMascot from "@/assets/aexo-mascot.png";

export default function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
      <motion.img
        src={aexoMascot}
        alt="Aexo"
        width={28}
        height={28}
        className="rounded-full"
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="glass rounded-3xl rounded-bl-sm px-5 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
