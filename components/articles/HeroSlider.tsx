'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChannelTag from './ChannelTag';

interface HeroArticle {
  id: string;
  headline: string;
  deck: string | null;
  slug: string;
  published_at: Date | string | null;
  read_time_minutes: number | null;
  is_breaking: boolean;
  channel: {
    name: string;
    slug: string;
    color_hex: string;
  } | null;
  images: {
    image_url: string;
    alt_text: string | null;
  }[];
}

interface HeroSliderProps {
  articles: HeroArticle[];
}

export function HeroSlider({ articles }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = articles.length;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % total);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
    setProgress(0);
  };

  const goToSlide = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
  };

  // Manage auto-advance timer and progress bar
  useEffect(() => {
    if (total === 0) return;

    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Progress bar runs every 50ms to hit 100% in 5 seconds (5000ms / 50ms = 100 steps)
    const stepTime = 50;
    const totalTime = 5000;
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (stepTime / totalTime) * 100;
      });
    }, stepTime);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [current, isPaused, total]);

  if (total === 0) return null;

  const article = articles[current];
  const heroImage = article.images?.[0]?.image_url || '/images/css_fallback.png';
  const altText = article.images?.[0]?.alt_text || article.headline;

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="hero-slider relative w-full h-[480px] bg-near-black border border-border/80 rounded-2xl overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Hero Image with sleek gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={altText}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/75 to-transparent z-10" />
      </div>

      {/* Slide Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col gap-4 max-w-3xl">
        <div className="flex items-center gap-3">
          {article.channel && (
            <ChannelTag
              name={article.channel.name}
              colorHex={article.channel.color_hex}
            />
          )}
          {article.is_breaking && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rift-red/20 border border-rift-red text-[11px] font-extrabold tracking-wider text-rift-red uppercase">
              <span className="w-2 h-2 rounded-full bg-rift-red animate-pulse" />
              Breaking
            </span>
          )}
        </div>

        <Link href={`/${article.slug}`}>
          <h2 className="text-display-l md:text-display-xl font-extrabold text-off-white hover:text-rift-red transition-colors line-clamp-2 leading-tight">
            {article.headline}
          </h2>
        </Link>

        {article.deck && (
          <p className="text-body-l text-muted line-clamp-2 font-medium">
            {article.deck}
          </p>
        )}

        <div className="flex items-center gap-4 text-label font-mono text-muted">
          <span>{formattedDate}</span>
          {article.read_time_minutes && (
            <>
              <span>•</span>
              <span>{article.read_time_minutes} min read</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Arrows (Left/Right) - Hidden on mobile, visible on desktop hover */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-near-black/75 border border-border/60 text-off-white flex items-center justify-center hover:bg-rift-red hover:border-rift-red hover:text-near-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Previous slide"
      >
        &larr;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-near-black/75 border border-border/60 text-off-white flex items-center justify-center hover:bg-rift-red hover:border-rift-red hover:text-near-black transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Next slide"
      >
        &rarr;
      </button>

      {/* Navigation Dots (Bottom Right) */}
      <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full border transition-all duration-300 ${
              idx === current
                ? 'bg-rift-red border-rift-red scale-110'
                : 'bg-near-black/60 border-border/80 hover:border-off-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Auto-advance Progress Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/40 z-30">
        <div
          className="h-full bg-rift-red transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default HeroSlider;
