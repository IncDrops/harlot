import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <h1 className={cn("font-heading text-2xl font-bold text-primary truncate", className)}>
      Pollitago
    </h1>
  );
}

export function Tagline({ className }: { className?: string }) {
  return (
    <p className={cn("font-body text-xs uppercase tracking-wider text-primary/80", className)}>
      AI-Powered Second Opinions
    </p>
  );
}
