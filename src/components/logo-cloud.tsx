"use client";

import Image from "next/image";

const logos = [
    { src: "https://placehold.co/120x40.png", alt: "Company Logo Placeholder", hint: "company logo" },
    { src: "https://placehold.co/120x40.png", alt: "Company Logo Placeholder", hint: "company logo" },
    { src: "https://placehold.co/120x40.png", alt: "Company Logo Placeholder", hint: "company logo" },
    { src: "https://placehold.co/120x40.png", alt: "Company Logo Placeholder", hint: "company logo" },
];

export function LogoCloud() {
  return (
    <section className="w-full">
      <div className="text-center text-sm text-muted-foreground tracking-wider mb-6">
        POWERING THE WORLD'S MOST INNOVATIVE COMPANIES
      </div>
      <div
        className="relative w-full overflow-hidden 
        [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
      >
        <div className="animate-marquee-infinite flex w-max">
          {logos.map((logo, index) => (
            <div key={index} className="mx-8 flex w-40 items-center justify-center py-5">
              <Image
                src={logo.src}
                alt={logo.alt}
                data-ai-hint={logo.hint}
                width={120}
                height={40}
                className="opacity-60 transition-opacity duration-300 hover:opacity-100 dark:brightness-0 dark:invert"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
           {logos.map((logo, index) => (
            <div key={index + logos.length} aria-hidden="true" className="mx-8 flex w-40 items-center justify-center py-5">
              <Image
                src={logo.src}
                alt={logo.alt}
                data-ai-hint={logo.hint}
                width={120}
                height={40}
                className="opacity-60 transition-opacity duration-300 hover:opacity-100 dark:brightness-0 dark:invert"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
