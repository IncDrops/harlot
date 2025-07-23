"use client";

import Image from "next/image";

const logos = [
    { src: "/arcol-logo.svg", alt: "Arcol Logo" },
    { src: "/drifting-in-space-logo.svg", alt: "Drifting in Space Logo" },
    { src: "/paloma-logo.svg", alt: "Paloma Logo" },
    { src: "/resend-logo.svg", alt: "Resend Logo" },
    { src: "/arcol-logo.svg", alt: "Arcol Logo Dupe" },
    { src: "/drifting-in-space-logo.svg", alt: "Drifting in Space Logo Dupe" },
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
                width={120}
                height={40}
                className="opacity-60 transition-opacity duration-300 hover:opacity-100 dark:invert"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
           {logos.map((logo, index) => (
            <div key={index + logos.length} aria-hidden="true" className="mx-8 flex w-40 items-center justify-center py-5">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                className="opacity-60 transition-opacity duration-300 hover:opacity-100 dark:invert"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
