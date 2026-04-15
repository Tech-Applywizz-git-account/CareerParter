"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { Building2 } from "lucide-react";

interface CompanyCardProps {
  id: string;
  name: string;
  sponsored_jobs: number;
}
export const CompanyCard = ({ id, name, sponsored_jobs }: CompanyCardProps) => {
  return (
    <Link
      href={`/company-analysis/${encodeURIComponent(id)}`}
      className="block h-full"
    >
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center border hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
        {/* Dummy Logo */}
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/5 text-primary font-semibold text-xl mb-3">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Company Name */}
        <h3
          className="font-medium text-base mb-1 max-w-[200px] truncate group-hover:text-primary transition-colors"
          title={name} // tooltip for full name
        >
          {name}
        </h3>

        {/* Sponsored Jobs */}
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          {sponsored_jobs} sponsored job{sponsored_jobs !== 1 ? "s" : ""}
        </p>
      </Card>
    </Link>
  );
};
