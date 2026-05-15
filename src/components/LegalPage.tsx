import { m } from "motion/react";
import type { ReactNode } from "react";

type LegalPageProps = {
  label: string;
  title: string;
  children: ReactNode;
};

export function LegalPage({ label, title, children }: LegalPageProps) {
  return (
    <m.section
      aria-label={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="my-3 mb-4">
        <p className="m-0 mb-1 text-xs font-extrabold uppercase text-muted-foreground">{label}</p>
        <h2 className="m-0 text-[1.7rem] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid gap-4 text-sm leading-relaxed text-secondary-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </m.section>
  );
}
