import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  className?: string;
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
      <div className="flex items-center gap-1.5">
        <span className="loader-dot h-2.5 w-2.5 rounded-full bg-solid-primary" />
        <span className="loader-dot h-2.5 w-2.5 rounded-full bg-solid-primary [animation-delay:0.15s]" />
        <span className="loader-dot h-2.5 w-2.5 rounded-full bg-solid-primary [animation-delay:0.3s]" />
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
        <div className="flex items-center gap-1.5">
          <span className="loader-dot h-3 w-3 rounded-full bg-solid-primary" />
          <span className="loader-dot h-3 w-3 rounded-full bg-solid-primary [animation-delay:0.15s]" />
          <span className="loader-dot h-3 w-3 rounded-full bg-solid-primary [animation-delay:0.3s]" />
        </div>
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
