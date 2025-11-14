"use client";

import React from "react";

type Props = {
  currentStep: number; // 1-based index
  totalSteps?: number; // default 5
  className?: string;
};

/**
 * Dot + connector progress bar to mirror the provided signup mocks.
 * - Renders N small circular dots connected by thin lines.
 * - Dots up to and including currentStep are green; others are gray.
 * - Connectors before the current step are green; others are gray.
 */
export default function SignupProgress({ currentStep, totalSteps = 5, className = "" }: Props) {
  const clamped = Math.max(1, Math.min(currentStep, totalSteps));
  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label="Signup progress"
    >
      <div className="flex items-center w-full">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepIndex = idx + 1;
          const dotActive = stepIndex <= clamped; // current and previous dots
          const connectorActive = stepIndex < clamped; // connectors before current
          return (
            <div key={stepIndex} className="flex items-center">
              {/* Dot */}
              <div
                className={`h-4 w-4 rounded-full ${dotActive ? "bg-green-600" : "bg-gray-300"}`}
              />
              {/* Connector to next */}
              {stepIndex < totalSteps && (
                <div
                  className={`mx-2 h-[2px] shrink-0 ${
                    stepIndex === 1 ? "w-8 sm:w-12" : "w-16 sm:w-24"
                  } ${connectorActive ? "bg-green-600" : "bg-gray-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
