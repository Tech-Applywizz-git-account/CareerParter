"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Filter, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorshipTable } from "@/components/SponsorshipTable";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";
import { generateDummyJobs } from "@/lib/dummyData";

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
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { selectedCountry, fromDate, toDate } = useFilters();

  const [allJobs, setAllJobs] = useState<SponsorshipJob[]>([]);
  const [loading, setLoading] = useState(true);

  const roleName = decodeURIComponent(params.id as string);

  // Re-fetch when country changes
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/domain/${encodeURIComponent(roleName)}?country=${encodeURIComponent(selectedCountry.value)}`;
      const res = await fetch(url);
      const data = await res.json();

      let mapped: SponsorshipJob[] = (data.jobs || []).map(
        (job: any, index: number) => ({
          id: index + 1,
          companyName: job.company,
          companyId: job.company ?? `company-${index}`,
          domainName: job.domain,
          role: job.role,
          location: job.location,
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true,
        }),
      );

      // If DB returns no records (e.g. for UAE/Dubai), inject dummy data so UI is testable
      if (mapped.length === 0 && selectedCountry.value !== "United States of America") {
        mapped = generateDummyJobs(roleName, selectedCountry.value, 15);
      }

      setAllJobs(mapped);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [roleName, selectedCountry.value]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Client-side date filtering ──────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    if (!fromDate || !toDate) return allJobs;
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return allJobs.filter((job) => {
      if (!job.postedDate) return false;
      const posted = new Date(job.postedDate);
      return posted >= from && posted <= to;
    });
  }, [allJobs, fromDate, toDate]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded bg-muted/40 animate-pulse" />
        <div className="h-32 rounded-xl bg-muted/30 animate-pulse" />
        <div className="h-64 rounded-xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Domains
      </Button>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 lg:p-5 space-y-4 shadow-sm">
        {/* Country Selector */}
        <CountrySelector />

        <div className="border-t border-border" />

        {/* Date Range */}
        <DateRangePicker />

        {/* Active filter badge */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Showing:</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {roleName}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span className={`${selectedCountry.flag} rounded-[2px]`}></span>
            <span>{selectedCountry.label}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-foreground text-xs font-medium">
            {formatDate(fromDate)} → {formatDate(toDate)}
          </span>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold mb-1">{roleName}</h1>
        <p className="text-muted-foreground">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} in{" "}
          {selectedCountry.label} · {formatDate(fromDate)} – {formatDate(toDate)}
          {allJobs.length !== filteredJobs.length && (
            <span className="text-muted-foreground/70 ml-1">
              ({allJobs.length} total before date filter)
            </span>
          )}
        </p>
      </div>

      {/* ── Jobs Table / Empty State ────────────────────────────────────────── */}
      {filteredJobs.length > 0 ? (
        <SponsorshipTable jobs={filteredJobs} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-card border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <SearchX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No roles found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            We couldn&apos find any {roleName} positions in {selectedCountry.label} matching your date range.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
            className="border-primary text-primary hover:bg-primary/5"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
