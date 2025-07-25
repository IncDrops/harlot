"use client";

import Image from "next/legacy/image";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
  companyLogoUrl: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  title,
  avatarUrl,
  companyLogoUrl,
  className,
}: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col justify-between p-6 md:p-8",
        "bg-card/70 border-transparent",
        // Glowing border effect
        "before:absolute before:-inset-px before:rounded-lg before:bg-gradient-to-r before:from-primary/30 before:to-primary/70 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex-1">
          <p className="text-lg md:text-xl text-foreground/90">"{quote}"</p>
        </div>
        <footer className="mt-6 flex items-center gap-4">
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="rounded-full"
            data-ai-hint="user avatar"
          />
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </footer>
      </div>
    </Card>
  );
}
