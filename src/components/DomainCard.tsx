"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { ArrowRight } from "lucide-react";

interface DomainCardProps {
  id: string;
  name: string;
  icon?: string;
  category: string; // "tech" or "non-tech"
  country?: string; // e.g. "USA"
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  jobCount?: number; // Show number of jobs available
}
function formatDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const DomainCard = ({
  id,
  name,
  icon,
  category,
  country,
  fromDate,
  toDate,
  jobCount,
}: DomainCardProps) => {
  return (
    <Link href={`/role-analysis/${encodeURIComponent(id)}`} className="block">
      <Card className="min-h-[220px] p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full flex flex-col justify-between border-border hover:border-primary/20 bg-card">
        <div>
          <div className="flex items-start justify-between mb-4">
            {/* icon */}
            <div className="text-4xl filter drop-shadow-sm">{icon ? icon : "💼"}</div>

            {/* Badges area */}
            <div className="flex flex-col items-end gap-2">
              <span className="px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold bg-accent text-accent-foreground rounded-full border border-border">
                {category === "tech" ? "Tech" : "Non-Tech"}
              </span>
              {jobCount !== undefined && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                  {jobCount} {jobCount === 1 ? "job" : "jobs"}
                </span>
              )}
            </div>
          </div>

          {/* Role name */}
          <h3 className="font-medium text-lg mb-2">{name}</h3>

          {/* Context pill: country + date range */}
          {country && fromDate && toDate && (
            <p className="text-xs text-muted-foreground">
              {country} · {formatDate(fromDate)} – {formatDate(toDate)}
            </p>
          )}
        </div>

        {/* Hover "View jobs" effect */}
        <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-4">
          View jobs
          <ArrowRight className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
};
