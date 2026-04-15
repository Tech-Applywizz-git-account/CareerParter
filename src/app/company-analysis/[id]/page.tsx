"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorshipTable } from "@/components/SponsorshipTable";

// 👇 Expected shape by SponsorshipTable
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

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [jobs, setJobs] = useState<SponsorshipJob[]>([]);
  const [loading, setLoading] = useState(true);

  const companyName = decodeURIComponent(params.id as string);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(
          `/api/company/${encodeURIComponent(companyName)}`,
        );
        const data = await res.json();

        const mappedJobs: SponsorshipJob[] = (data.jobs || []).map(
          (job: any, index: number) => ({
            id: index + 1,
            companyName: job.company,
            companyId: job.company ?? `company-${index}`,
            domainName: job.domain,
            role: job.role,
            location: job.location,
            postedDate: job.posted,
            jobLink: job.link,
            sponsorship: true, // or derive from job if you ever add this field
          }),
        );

        setJobs(mappedJobs);
      } catch (err) {
        console.error("Error fetching company jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [companyName]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center text-muted-foreground">
        Loading jobs for {companyName}...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
        <p className="text-muted-foreground">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Jobs Table */}
      {jobs.length > 0 ? (
        <SponsorshipTable jobs={jobs} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No jobs found for this company.
        </div>
      )}
    </div>
  );
}
