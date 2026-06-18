import { MapPin } from "lucide-react";

interface ShiftPosBadgeProps {
  shift: number;
  pos: 1 | 2;
  size?: "sm" | "md";
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-[0.6875rem]",
  md: "px-2.5 py-1 text-xs",
};

// Subtle pastel coding to distinguish positions at a glance.
const posStyles = {
  1: "bg-[#edf3ec] text-[#346538] border-[#d6e4d5]",
  2: "bg-[#e8f0fb] text-[#1f5c93] border-[#d3e1f3]",
};

const iconSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
};

export function ShiftPosBadge({ shift, pos, size = "md" }: ShiftPosBadgeProps) {
  return (
    <span
      className={`nums inline-flex items-center gap-1 rounded-md border font-medium ${sizeStyles[size]} ${posStyles[pos]}`}
    >
      <span>S{shift}</span>
      <MapPin className={iconSize[size]} strokeWidth={2} />
      <span>P{pos}</span>
    </span>
  );
}
