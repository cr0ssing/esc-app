import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

type AnimatedMetricProps = {
  value: string;
  className?: string;
  emphasis?: "default" | "highlight";
};

const pulseTransition = { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const };

export function AnimatedMetric({ value, className, emphasis = "default" }: AnimatedMetricProps) {
  const reduceMotion = useReducedMotion();
  const previous = useRef(value);
  const isFirst = useRef(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      previous.current = value;
      return;
    }
    if (previous.current !== value) {
      previous.current = value;
      setPulse((count) => count + 1);
    }
  }, [value]);

  const highlight =
    emphasis === "highlight" ? "var(--color-highlight-bright)" : "var(--color-accent)";

  if (reduceMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span
      key={pulse}
      className={cn("inline-block origin-center", className)}
      initial={pulse === 0 ? false : { scale: 0.88, opacity: 0.55 }}
      animate={
        pulse === 0
          ? { scale: 1, opacity: 1 }
          : {
            scale: [0.88, 1.14, 1],
            opacity: [0.55, 1, 1],
            color: ["var(--color-foreground)", highlight, "var(--color-foreground)"],
          }
      }
      transition={pulseTransition}
    >
      {value}
    </motion.span>
  );
}
