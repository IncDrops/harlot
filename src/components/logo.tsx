import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <h1 className={cn("font-headline text-4xl font-bold tracking-tighter", className)}>
      <span style={{ color: '#5271ff' }}>Poll</span>
      <span style={{ color: '#f6bc18' }}>it</span>
      <span style={{ color: '#5271ff' }}>A</span>
      <span style={{ color: '#00bf63' }}>Go</span>
    </h1>
  );
}

export function Tagline({ className }: { className?: string }) {
  return (
    <p className={cn("font-body text-sm uppercase tracking-widest text-foreground", className)}>
      THE <sup>2nd</sup> OPINION APP
    </p>
  );
}
