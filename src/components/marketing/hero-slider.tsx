"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Code2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    icon: Code2,
    eyebrow: "Coding challenges",
    title: "Hire on evidence, not guesswork.",
    body: "Run coding, written and multiple-choice assessments in a timed workspace. Every attempt ends with a clear score.",
    cta: { href: "/assessments", label: "Browse assessments" },
  },
  {
    icon: ClipboardCheck,
    eyebrow: "For hiring teams",
    title: "Build a test once, invite anyone.",
    body: "Assemble assessments from your question bank, set timing and a passing score, then invite candidates by email.",
    cta: { href: "/register", label: "Create a company account" },
  },
  {
    icon: CreditCard,
    eyebrow: "For candidates",
    title: "Prove what you can do.",
    body: "Accept an invitation, take the assessment within the time limit, and see your result as soon as it is scored.",
    cta: { href: "/login", label: "Try the demo login" },
  },
] as const;

const INTERVAL_MS = 6000;

/** Auto-advancing hero slider with arrows and dots. Autoplay pauses on hover/focus and for reduced-motion users. */
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % SLIDES.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, index]);

  const go = (next: number) => setIndex((next + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative flex h-[65svh] max-h-[44rem] min-h-[30rem] flex-col overflow-hidden border-b border-border bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="bg-mesh absolute inset-0" aria-hidden />
      <div className="bg-dot-grid absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 items-center px-4 sm:px-6">
        {SLIDES.map((slide, slideIndex) => {
          const active = slideIndex === index;
          return (
            <div
              key={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${SLIDES.length}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-x-4 grid items-center gap-8 transition-all duration-500 sm:inset-x-6 lg:grid-cols-5",
                active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
              )}
            >
              <div className="lg:col-span-3">
                <p className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                  <slide.icon className="size-3.5 text-primary" aria-hidden />
                  {slide.eyebrow}
                </p>
                {slideIndex === 0 ? (
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                    <span className="text-gradient-brand">{slide.title}</span>
                  </h1>
                ) : (
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{slide.title}</h2>
                )}
                <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{slide.body}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href={slide.cta.href} tabIndex={active ? 0 : -1}>
                      {slide.cta.label}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/help" tabIndex={active ? 0 : -1}>
                      How it works
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden justify-center lg:col-span-2 lg:flex" aria-hidden>
                <div className="flex size-56 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-glow">
                  <slide.icon className="size-24" strokeWidth={1.25} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 pb-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous slide" onClick={() => go(index - 1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next slide" onClick={() => go(index + 1)}>
            <ChevronRight />
          </Button>
          <div className="ml-2 flex gap-2">
            {SLIDES.map((slide, dotIndex) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                onClick={() => go(dotIndex)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  dotIndex === index ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        </div>
        <a href="#stats" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
          Scroll to explore <ChevronDown className="size-4 animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  );
}
