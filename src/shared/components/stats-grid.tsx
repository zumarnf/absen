import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  small?: boolean;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`card-hover animate-fade-in-up delay-${index + 1}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {stat.title}
                  </p>
                  <p
                    className={`nums font-semibold text-foreground ${
                      stat.small ? "text-xl" : "text-3xl"
                    }`}
                  >
                    {stat.value}
                  </p>
                  {stat.hint && (
                    <p className="text-xs text-muted-foreground">{stat.hint}</p>
                  )}
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-foreground">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
