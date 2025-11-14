import { CircleArrowOutDownLeft } from "lucide-react";
import type { IconProps } from "./types";

// Match the provided PNG reference (lucide circle-arrow-out-down-left) for visual parity
export default function ReceiveIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <CircleArrowOutDownLeft
      size={size as number}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
