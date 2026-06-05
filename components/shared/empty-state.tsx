import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  children?: React.ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12 animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solid-surface mb-4">
        <Inbox className="h-6 w-6 text-solid-dark/60" />
      </div>
      <p className="text-muted-foreground mb-3">{message}</p>
      {children}
    </div>
  );
}
