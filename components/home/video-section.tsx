"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const REVIEW_ARTICLES = [
  {
    id: 1,
    title: "2019 Mercedes Benz Premium Review",
    category: "Expert Review",
    image: "/sample-car-1.jpg",
    hasVideo: true,
    href: "/reviews/1",
  },
  {
    id: 2,
    title: "2024 BMW X5 Full Test Drive",
    category: "Test Drive",
    image: "/sample-car-2.jpg",
    hasVideo: true,
    href: "/reviews/2",
  },
  {
    id: 3,
    title: "Toyota Land Cruiser 300 Series Review",
    category: "Expert Review",
    image: "/sample-car-3.jpg",
    hasVideo: true,
    href: "/reviews/3",
  },
  {
    id: 4,
    title: "Electric vs Hybrid: Which is Better?",
    category: "Comparison",
    image: "/sample-car-4.jpg",
    hasVideo: false,
    href: "/reviews/4",
  },
];

export function VideoSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? REVIEW_ARTICLES.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === REVIEW_ARTICLES.length - 1 ? 0 : prev + 1
    );
  };

  const currentArticle = REVIEW_ARTICLES[currentIndex];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1285px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Car reviews & updates
          </h2>
          <Link
            href="/reviews"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative rounded-[24px] overflow-hidden">
          {/* Main Carousel Card */}
          <Link
            href={currentArticle.href}
            className="relative aspect-video block w-full group cursor-pointer"
          >
            <Image
              src={currentArticle.image}
              alt={currentArticle.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Custom Reviews Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/35 group-hover:via-black/30 transition-colors" />

            {/* Play button (if video) */}
            {currentArticle.hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                </div>
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm font-medium text-white/80 tracking-wider uppercase mb-2">
                  {currentArticle.category}
                </p>
                <h3 className="text-2xl sm:text-4xl font-bold text-white">
                  {currentArticle.title}
                </h3>
              </div>
            </div>
          </Link>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors border border-white/20"
            aria-label="Previous article"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors border border-white/20"
            aria-label="Next article"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
            {REVIEW_ARTICLES.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to article ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
