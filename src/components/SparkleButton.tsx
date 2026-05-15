import { useCallback, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

type SparkleVariant = "default" | "winner" | "favorite";

type SparkleParticle = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  shape: "dot" | "star";
};

const SPARKLE_COLORS: Record<SparkleVariant, string[]> = {
  default: ["#ffe066", "#f2c94c", "#fff3bf", "#ffffff"],
  winner: ["#ffe066", "#f2c94c", "#fff3bf", "#ffffff"],
  favorite: ["#ffe066", "#f2c94c", "#fff3bf", "#ffffff"],
};

type SparkleButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  sparkleVariant?: SparkleVariant;
  children?: ReactNode;
};

export function SparkleButton({
  children,
  onClick,
  sparkleVariant = "default",
  className,
  ...props
}: SparkleButtonProps) {
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [bursting, setBursting] = useState(false);

  const burst = useCallback(() => {
    const colors = SPARKLE_COLORS[sparkleVariant];
    const next = Array.from({ length: 10 }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      angle: (index / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      distance: 12 + Math.random() * 20,
      size: 2.5 + Math.random() * 3.5,
      color: colors[index % colors.length] ?? colors[0],
      shape: index % 3 === 0 ? ("star" as const) : ("dot" as const),
    }));
    setBursting(true);
    setParticles(next);
    window.setTimeout(() => {
      setParticles([]);
      setBursting(false);
    }, 520);
  }, [sparkleVariant]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    burst();
    onClick?.(event);
  };

  const mergedClassName = ["sparkle-button", bursting && "is-bursting", className].filter(Boolean).join(" ");

  return (
    <motion.button className={mergedClassName} {...props} onClick={handleClick}>
      <span className="sparkle-burst" aria-hidden="true">
        <AnimatePresence>
          {particles.map((particle) => {
            const offsetX = Math.cos(particle.angle) * particle.distance;
            const offsetY = Math.sin(particle.angle) * particle.distance;
            const half = particle.size / 2;

            return (
              <motion.span
                key={particle.id}
                className={particle.shape === "star" ? "sparkle-particle is-star" : "sparkle-particle"}
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
