import { MapPin } from "lucide-react";

interface ShiftPosBadgeProps {
  shift: number;
  pos: 1 | 2;
  size?: "sm" | "md";
}

const sizeStyles = {
  sm: "px-2 py-0.5 rounded-md text-xs",
  md: "px-2.5 py-1 rounded-lg text-xs",
};

const posStyles = {
  1: "bg-emerald-100 text-emerald-700",
  2: "bg-violet-100 text-violet-700",
};

const iconSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
};

export function ShiftPosBadge({ shift, pos, size = "md" }: ShiftPosBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium transition-transform duration-200 hover:scale-105 ${sizeStyles[size]} ${posStyles[pos]}`}
    >
      <span>S{shift}</span>
      <MapPin className={iconSize[size]} />
      <span>P{pos}</span>
    </span>
  );
}
