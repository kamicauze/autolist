"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "How long does the import process take?",
    answer:
      "Typically 4-8 weeks from purchase to Kenya delivery, depending on the origin country and shipping method. We keep you updated throughout the entire process.",
  },
  {
    question: "What costs are involved?",
    answer:
      "Costs include the vehicle price, shipping, Kenyan import duties, VAT, testing, registration, and our service fee. We provide a detailed breakdown before you commit.",
  },
  {
    question: "Do you handle all the paperwork?",
    answer:
      "Yes! We manage all documentation including customs clearance, registration/testing, and ensure the vehicle meets all import regulations.",
  },
  {
    question: "What markets do you source from?",
    answer:
      "We source vehicles from Japan, USA, Europe, and other key automotive markets worldwide, giving you access to the widest selection of vehicles.",
  },
];

export function ImportFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl py-16">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>

      <div className="divide-y divide-gray-200">
        {FAQ_ITEMS.map((item, index) => (
          <div key={index} className="py-5">
            <button
              type="button"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-base font-semibold text-gray-900">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "ml-4 h-5 w-5 shrink-0 text-gray-500 transition-transform",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
