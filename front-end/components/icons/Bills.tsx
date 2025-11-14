import { Wallet } from "lucide-react";
import type { IconProps } from "./types";

// Using Lucide's Wallet icon for pay bills functionality (represents cash/money payment)
export default function BillsIcon({ size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <Wallet 
      size={size} 
      className={className} 
      strokeWidth={strokeWidth}
    />
  );
}
