import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  className?: string;
}

function Dots({ size = "sm" }: { size?: "sm" | "md" }) {
  const dot = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("loader-dot rounded-full bg-foreground", dot)} />
      <span
        className={cn("loader-dot rounded-full bg-foreground", dot)}
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className={cn("loader-dot rounded-full bg-foreground", dot)}
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

export function PageLoader({
  message = "Memuat data...",
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <Dots />
      {message && (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

interface ButtonLoaderProps {
  message?: string;
  className?: string;
}

export function ButtonLoader({ message, className }: ButtonLoaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {message && <span>{message}</span>}
    </span>
  );
}

interface OverlayLoaderProps {
  message?: string;
  open?: boolean;
}

export function OverlayLoader({
  message = "Memproses...",
  open = true,
}: OverlayLoaderProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 animate-scale-in">
        <Dots size="md" />
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
