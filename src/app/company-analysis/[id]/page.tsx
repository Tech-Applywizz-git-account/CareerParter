"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorshipTable } from "@/components/SponsorshipTable";

import { useFilters } from "@/contexts/FiltersContext";

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

// Interface for API response
interface APIJob {
  company: string;
  domain: string;
  role: string;
  location: string;
  posted: string;
  link: string;
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [jobs, setJobs] = useState<SponsorshipJob[]>([]);
  const [loading, setLoading] = useState(true);

  const { selectedCountries } = useFilters();
  const companyName = decodeURIComponent(params.id as string);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const countryValues = selectedCountries.map(c => c.value).join(",");
        const url = `/api/company/${encodeURIComponent(companyName)}?countries=${encodeURIComponent(countryValues)}`;
        const res = await fetch(url);
        const data = await res.json();

        const mappedJobs: SponsorshipJob[] = (data.jobs || []).map(
          (job: APIJob, index: number) => ({
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
  }, [companyName, selectedCountries]);


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
      <SponsorshipTable jobs={jobs} loading={loading} />
    </div>
  );
}
