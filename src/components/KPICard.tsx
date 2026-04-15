import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
}

export const KPICard = ({ title, value, icon: Icon, trend }: KPICardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-smooth animate-slide-up border-primary/10 bg-gradient-to-br from-card to-card/50 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-accent font-semibold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl group-hover:scale-110 transition-smooth border border-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
