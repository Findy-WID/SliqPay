"use client";

import { CircleArrowOutUpRight } from "lucide-react";
import type { IconProps } from "./types";

// Use Lucide's official CircleArrowOutUpRight to match the PNG exactly
export default function SendIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <CircleArrowOutUpRight
      size={size as number}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
