"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EVENT_TITLES = [
  "a party",
  "food trucks",
  "a bar crawl",
  "a boba social",
  "a flea market",
  "a beach trip",
  "a live show",
  "a campus kickback",
];

export function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => EVENT_TITLES, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2200);
    return () => clearTimeout(id);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-8 py-24 md:py-36 text-center">

          {/* ── Animated headline ── */}
          <div className="flex flex-col items-center">
            {/* The slot lives INSIDE the h1 so em units inherit the heading font-size */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight flex flex-col items-center gap-1">
              <span>I&apos;m looking for</span>

              {/* Slot: clip-path clips only vertically (for the slide animation)
                  but leaves horizontal space unlimited, so long phrases never get cut */}
              <span className="relative flex h-[1.2em] w-full justify-center [clip-path:inset(0_-100vw)]">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-black tracking-tighter bg-gradient-to-r from-[#f0abff] to-[#c084fc] bg-clip-text text-transparent whitespace-nowrap"
                    initial={{ opacity: 0, y: "1em" }}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : {
                            y: titleNumber > index ? "-1em" : "1em",
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
          </div>

          {/* ── Tagline ── */}
          <div className="flex flex-col gap-2 max-w-xl">
            <p className="text-lg md:text-xl font-bold text-white/90">
              p-ull up: discover functions happening all over the 5Cs
            </p>
            <p className="text-sm md:text-base text-white/65 font-medium">
              where you&apos;ll go to find what you&apos;re doing when you&apos;re off student mode
            </p>
          </div>

          {/* ── CTAs ── */}
          <div className="flex flex-row flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              className="gap-3 border border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white backdrop-blur-sm font-bold"
              asChild
            >
              <Link href="/events">
                See events near me <MoveRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              className="gap-3 bg-white text-[#9733ee] hover:bg-white/90 font-black shadow-xl"
              asChild
            >
              <Link href="/eventposting">
                Create an event <CalendarPlus className="w-4 h-4" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
