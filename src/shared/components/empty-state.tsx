import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  children?: React.ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="animate-fade-in-up py-12 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="mb-3 text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}
