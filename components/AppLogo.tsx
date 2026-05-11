"use client";

import Image from "next/image";

type AppLogoProps = {
  className?: string;
  priority?: boolean;
};

export function AppLogo({ className, priority = false }: AppLogoProps) {
  return (
    <div className={className}>
      <Image
        src="/logo_idealink.png"
        alt="Idea Link"
        width={240}
        height={78}
        priority={priority}
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
