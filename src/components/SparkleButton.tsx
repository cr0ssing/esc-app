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
};

export function SparkleButton({
  children,
  onClick,
  className,
  sparkleVariant = "golden",
  ...props
}: SparkleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null);
  const [bursting, setBursting] = useState(false);

  const burst = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setBurstOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    const palette = SPARKLE_PALETTES[sparkleVariant];
    const next = Array.from({ length: 14 }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      angle: (index / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      distance: 18 + Math.random() * 28,
      size: 4 + Math.random() * 5,
      color: palette[index % palette.length] ?? palette[0],
      shape: index % 3 === 0 ? ("star" as const) : ("dot" as const),
    }));
    setBursting(true);
    setParticles(next);
    window.setTimeout(() => {
      setParticles([]);
      setBurstOrigin(null);
      setBursting(false);
    }, 780);
  }, [sparkleVariant]);

  const triggerSparkleBurst = (event: React.MouseEvent<HTMLButtonElement>) => {
    burst();
    onClick?.(event);
  };

  const sparkleLayer =
    burstOrigin && particles.length > 0
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
          className,
        )}
        {...props}
        onClick={triggerSparkleBurst}
      >
        {children}
      </m.button>
      {sparkleLayer}
    </>
  );
}
