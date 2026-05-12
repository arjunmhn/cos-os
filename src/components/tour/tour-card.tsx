"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import type { TourStep } from "./tour-provider";

export function TourCard({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onNext, onPrev]);

  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 sm:max-w-[380px] sm:w-full">
      <div className="rounded-2xl bg-white border divider shadow-elevated overflow-hidden">
        {/* Header strip */}
        <div className="px-4 py-2.5 bg-gradient-brand text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold truncate">
              Tour · {stepIndex + 1} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/15 transition-colors shrink-0"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 flex gap-0.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full ${i <= stepIndex ? "bg-zinc-900" : "bg-zinc-200"}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            {step.label}
          </h3>
          <p className="mt-1.5 text-[13px] text-zinc-600 leading-relaxed">{step.body}</p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onPrev} disabled={isFirst}>
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 px-2 py-1"
            >
              Skip
            </button>
            <Button variant="primary" size="sm" onClick={onNext}>
              {isLast ? (
                <>
                  Done <Check className="h-3 w-3" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
