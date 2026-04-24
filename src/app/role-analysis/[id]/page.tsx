"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorshipTable } from "@/components/SponsorshipTable";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";

interface SponsorshipJob {
  id: number;
  companyName: string;
  companyId: string;
  domainName: string;
  role: string;
  location: string;
  postedDate: string;
  jobLink: string;
  sponsorship: boolean;
  website?: string;
}

interface APIJob {
  company: string;
  domain: string;
  role: string;
  location: string;
  posted: string;
  link: string;
  website?: string;
}

function formatDate(d: string) {
  if (!d) return "All Time";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedCountries, fromDate, toDate } = useFilters();

  const [allJobs, setAllJobs] = useState<SponsorshipJob[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const rawId = (params.id as string) || "";
  const roleName = decodeURIComponent(decodeURIComponent(rawId));

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // 🚀 Pass date filters to the API so we get date-filtered results
      const params = new URLSearchParams({
        countries: selectedCountries.map(c => c.value).join(","),
      });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const url = `/api/domain/${encodeURIComponent(roleName)}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      const mapped: SponsorshipJob[] = (data.jobs || []).map(
        (job: APIJob, index: number) => ({
          id: index + 1,
          companyName: job.company,
          companyId: job.company ?? `company-${index}`,
          domainName: job.domain,
          role: job.role,
          location: job.location,
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true,
          website: job.website,
        }),
      );

      setAllJobs(mapped);
      // 🚀 Use exact DB count from API rather than rows loaded
      setTotalCount(data.totalCount ?? mapped.length);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [roleName, selectedCountries, fromDate, toDate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Date filtering is now done at the API level — allJobs is already filtered
  const filteredJobs = allJobs;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Domains
      </Button>

      <div className="bg-card border border-border rounded-xl p-4 lg:p-5 space-y-4 shadow-sm">
        <CountrySelector />
        <div className="border-t border-border" />
        <DateRangePicker />
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Showing:</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {roleName}
          </span>
          {selectedCountries.map(c => (
            <span key={c.value} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <span className={`${c.flag} rounded-[2px]`}></span>
              <span>{c.label}</span>
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-foreground text-xs font-medium">
            {formatDate(fromDate)} → {formatDate(toDate)}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-1">{roleName}</h1>
        <p className="text-muted-foreground">
          {totalCount} job{totalCount !== 1 ? "s" : ""} in{" "}
          {selectedCountries.map(c => c.label).join(", ")} · {formatDate(fromDate)} – {formatDate(toDate)}
        </p>
      </div>

      <SponsorshipTable jobs={filteredJobs} loading={loading} />
    </div>
  );
}
