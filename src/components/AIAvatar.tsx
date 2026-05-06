import { forwardRef } from "react";
import { motion } from "framer-motion";
import aexoMascot from "@/assets/aexo-mascot.png";

interface AIAvatarProps {
  size?: "sm" | "md" | "lg";
}

const AIAvatar = forwardRef<HTMLDivElement, AIAvatarProps>(
  ({ size = "lg" }, ref) => {
    const sizeMap = { sm: "w-12 h-12", md: "w-20 h-20", lg: "w-40 h-40" };

    return (
      <motion.div
        ref={ref}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Glow backdrop */}
        <div className={`${sizeMap[size]} rounded-full opacity-30 blur-xl absolute inset-0`}
          style={{ background: "hsl(var(--primary))" }}
        />
        
        {/* Mascot image */}
        <div className={`${sizeMap[size]} relative z-10`}>
          <img
            src={aexoMascot}
            alt="Aexo AI"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Floating particles */}
        {size === "lg" && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, (i % 2 === 0 ? 8 : -8), 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
                  top: `${20 + i * 15}%`,
                  left: i < 2 ? `-${10 + i * 5}%` : undefined,
                  right: i >= 2 ? `-${10 + (i - 2) * 5}%` : undefined,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    );
  }
);

AIAvatar.displayName = "AIAvatar";

export default AIAvatar;
