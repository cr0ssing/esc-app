import { useCallback, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { cn } from "../lib/cn";

type SparkleParticle = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: "dot" | "star";
};

const SPARKLE_COLORS = [
  "var(--color-highlight-bright)",
  "var(--color-highlight)",
  "var(--color-highlight-subtle)",
  "var(--color-foreground)",
] as const;

type SparkleButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
};

export function SparkleButton({
  children,
  onClick,
  className,
  ...props
}: SparkleButtonProps) {
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [bursting, setBursting] = useState(false);

  const burst = useCallback(() => {
    const next = Array.from({ length: 10 }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      angle: (index / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      distance: 12 + Math.random() * 20,
      size: 2.5 + Math.random() * 3.5,
      color: SPARKLE_COLORS[index % SPARKLE_COLORS.length] ?? SPARKLE_COLORS[0],
      shape: index % 3 === 0 ? ("star" as const) : ("dot" as const),
    }));
    setBursting(true);
    setParticles(next);
    window.setTimeout(() => {
      setParticles([]);
      setBursting(false);
    }, 520);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    burst();
    onClick?.(event);
  };

  return (
    <motion.button
      className={cn(
        "relative isolate overflow-visible",
        bursting && "is-bursting z-1 translate-z-0",
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      <span className="pointer-events-none absolute left-1/2 top-1/2 z-2 size-0 overflow-visible" aria-hidden="true">
        <AnimatePresence>
          {particles.map((particle) => {
            const offsetX = Math.cos(particle.angle) * particle.distance;
            const offsetY = Math.sin(particle.angle) * particle.distance;
            const half = particle.size / 2;

            return (
              <motion.span
                key={particle.id}
                className={cn(
                  "pointer-events-none absolute left-0 top-0 rounded-full",
                  particle.shape === "star" && "rounded-[1px]",
                )}
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  boxShadow: `0 0 ${particle.size * 2.5}px ${particle.color}`,
                }}
                initial={{ opacity: 1, scale: 0, rotate: 0, x: -half, y: -half }}
                animate={{
                  opacity: 0,
                  scale: 1.15,
                  rotate: particle.shape === "star" ? 140 : 0,
                  x: offsetX - half,
                  y: offsetY - half,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </AnimatePresence>
      </span>
      {children}
    </motion.button>
  );
}
