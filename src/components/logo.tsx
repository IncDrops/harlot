import { cn } from "@/lib/utils";
import Image from "next/legacy/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
        <Image 
            src="/logo.png" 
            alt="Pollitago Logo" 
            width={150} 
            height={40} 
            className="dark:invert"
            data-ai-hint="logo"
            priority
            style={{ width: 'auto', height: 'auto' }}
        />
    </div>
  );
}

export function Tagline({ className }: { className?: string }) {
  return (
    <p className={cn("font-body text-sm text-primary/90", className)}>
      AI-Powered Second Opinions
    </p>
  );
}
