"use client";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

/**
 * Universal full-screen animated background.
 * Wrap any page's root element with this to get the same dark
 * purple/blue gradient animation used on the Sign Up page.
 */
export default function AnimatedPageBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BackgroundGradientAnimation
      containerClassName="min-h-screen"
      className="min-h-screen"
    >
      {children}
    </BackgroundGradientAnimation>
  );
}
