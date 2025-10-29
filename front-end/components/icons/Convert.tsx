import { Repeat } from "lucide-react";
import type { IconProps } from "./types";

// Using Lucide's Repeat icon for convert/swap functionality
export default function ConvertIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <Repeat 
      size={size} 
      className={className} 
      strokeWidth={strokeWidth}
    />
  );
}
