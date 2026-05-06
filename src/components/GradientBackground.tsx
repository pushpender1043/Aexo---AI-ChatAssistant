import { forwardRef, ReactNode } from "react";

const GradientBackground = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="min-h-screen relative overflow-hidden bg-background">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-30 blur-3xl"
            style={{
              background: "hsl(var(--gradient-start))",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-1/3 -right-20 w-60 h-60 rounded-full opacity-25 blur-3xl"
            style={{
              background: "hsl(var(--gradient-mid))",
              animation: "float 8s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{
              background: "hsl(var(--gradient-end))",
              animation: "float 7s ease-in-out infinite 2s",
            }}
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GradientBackground.displayName = "GradientBackground";

export default GradientBackground;
