import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, type HTMLMotionProps } from "motion/react";
import { cn } from "../lib/cn";

type SparkleParticle = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: "dot" | "star";
};

type ConfettiParticle = {
  id: number;
  angle: number;
  distance: number;
  width: number;
  height: number;
  color: string;
  spin: number;
};

const GOLDEN_SPARKLE_COLORS = [
  "var(--color-highlight-bright)",
  "var(--color-highlight)",
  "var(--color-highlight-subtle)",
  "#fff8d6",
] as const;

const RED_SPARKLE_COLORS = [
  "var(--color-emphasis)",
  "#ff6b85",
  "#ff8fa3",
  "#ffc2cf",
] as const;

type SparkleVariant = "golden" | "red";

const SPARKLE_PALETTES: Record<SparkleVariant, readonly string[]> = {
  golden: GOLDEN_SPARKLE_COLORS,
  red: RED_SPARKLE_COLORS,
};

type SparkleButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
  sparkleVariant?: SparkleVariant;
  /** Extra sparkles, confetti, pulse ring, and a bouncy wiggle on click. */
  celebration?: boolean;
};

const CELEBRATION_CONFETTI_COLORS = [
  "var(--color-highlight-bright)",
  "var(--color-highlight)",
  "#fff8d6",
  "var(--color-emphasis)",
  "#ff8fa3",
  "#c8e6ff",
] as const;

export function SparkleButton({
  children,
  onClick,
  className,
  sparkleVariant = "golden",
  celebration = false,
  ...props
}: SparkleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showPulseRing, setShowPulseRing] = useState(false);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null);
  const [bursting, setBursting] = useState(false);
  const [cheering, setCheering] = useState(false);

  const burst = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setBurstOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    const palette = SPARKLE_PALETTES[sparkleVariant];
    const sparkleCount = celebration ? 24 : 14;
    const next = Array.from({ length: sparkleCount }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      angle: (index / sparkleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      distance: (celebration ? 22 : 18) + Math.random() * (celebration ? 36 : 28),
      size: 4 + Math.random() * (celebration ? 7 : 5),
      color: palette[index % palette.length] ?? palette[0],
      shape: index % 3 === 0 ? ("star" as const) : ("dot" as const),
    }));

    if (celebration) {
      const nextConfetti = Array.from({ length: 10 }, (_, index) => ({
        id: Date.now() + sparkleCount + index + Math.random(),
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.4 + (index % 2 === 0 ? 0.35 : -0.35),
        distance: 28 + Math.random() * 42,
        width: 5 + Math.random() * 4,
        height: 8 + Math.random() * 6,
        color: CELEBRATION_CONFETTI_COLORS[index % CELEBRATION_CONFETTI_COLORS.length] ?? palette[0],
        spin: (Math.random() - 0.5) * 540,
      }));
      setConfetti(nextConfetti);
      setShowPulseRing(true);
      setCheering(true);
    }

    setBursting(true);
    setParticles(next);
    const duration = celebration ? 920 : 780;
    window.setTimeout(() => {
      setParticles([]);
      setConfetti([]);
      setBurstOrigin(null);
      setBursting(false);
      setShowPulseRing(false);
      setCheering(false);
    }, duration);
  }, [celebration, sparkleVariant]);

  const triggerSparkleBurst = (event: React.MouseEvent<HTMLButtonElement>) => {
    burst();
    onClick?.(event);
  };

  const sparkleLayer =
    burstOrigin && (particles.length > 0 || confetti.length > 0 || showPulseRing)
      ? createPortal(
        <m.div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden="true"
          initial={false}
        >
          <span
            className="absolute size-0"
            style={{ left: burstOrigin.x, top: burstOrigin.y }}
          >
            <AnimatePresence>
              {showPulseRing ? (
                <m.span
                  key="pulse-ring"
                  className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-highlight-bright"
                  initial={{ opacity: 0.85, scale: 0.2, x: "-50%", y: "-50%" }}
                  animate={{ opacity: 0, scale: 2.8, x: "-50%", y: "-50%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
              {confetti.map((piece) => {
                const offsetX = Math.cos(piece.angle) * piece.distance;
                const offsetY = Math.sin(piece.angle) * piece.distance;

                return (
                  <m.span
                    key={piece.id}
                    className="pointer-events-none absolute left-0 top-0 rounded-[1px]"
                    style={{
                      width: piece.width,
                      height: piece.height,
                      background: piece.color,
                      boxShadow: `0 0 6px ${piece.color}`,
                    }}
                    initial={{ opacity: 1, scale: 0.4, rotate: 0, x: -piece.width / 2, y: -piece.height / 2 }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      rotate: piece.spin,
                      x: offsetX - piece.width / 2,
                      y: offsetY - piece.height / 2,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.82, ease: [0.18, 0.9, 0.32, 1.12] }}
                  />
                );
              })}
              {particles.map((particle) => {
                const offsetX = Math.cos(particle.angle) * particle.distance;
                const offsetY = Math.sin(particle.angle) * particle.distance;
                const half = particle.size / 2;

                return (
                  <m.span
                    key={particle.id}
                    className={cn(
                      "pointer-events-none absolute left-0 top-0 rounded-full",
                      particle.shape === "star" && "rounded-[1px]",
                    )}
                    style={{
                      width: particle.size,
                      height: particle.size,
                      background: particle.color,
                      boxShadow: `0 0 ${particle.size * 4}px ${particle.color}, 0 0 ${particle.size * 1.5}px #fff`,
                    }}
                    initial={{ opacity: 1, scale: 0, rotate: 0, x: -half, y: -half }}
                    animate={{
                      opacity: 0,
                      scale: 1.35,
                      rotate: particle.shape === "star" ? 160 : 0,
                      x: offsetX - half,
                      y: offsetY - half,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  />
                );
              })}
            </AnimatePresence>
          </span>
        </m.div>,
        document.body,
      )
      : null;

  return (
    <>
      <m.button
        ref={buttonRef}
        className={cn(
          "relative isolate",
          bursting && "is-bursting z-1 translate-z-0",
          celebration && "overflow-visible",
          className,
        )}
        animate={
          cheering
            ? { scale: [1, 1.22, 0.94, 1.1, 1], rotate: [0, -7, 6, -3, 0] }
            : undefined
        }
        transition={
          cheering
            ? { duration: 0.58, ease: [0.34, 1.45, 0.64, 1] }
            : undefined
        }
        {...props}
        onClick={triggerSparkleBurst}
      >
        {celebration ? (
          <m.span
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-highlight-bright/30"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={
              cheering
                ? { opacity: [0, 0.75, 0], scale: [0.88, 1.12, 1.28] }
                : { opacity: 0, scale: 0.88 }
            }
            transition={{ duration: 0.58, ease: "easeOut" }}
          />
        ) : null}
        {celebration ? <span className="relative z-1">{children}</span> : children}
      </m.button>
      {sparkleLayer}
    </>
  );
}
