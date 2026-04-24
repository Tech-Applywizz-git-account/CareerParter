"use client";

import { Fragment, useState, useMemo } from "react";
import { ExternalLink, ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Job {
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

const CompanyLogo = ({ name, website }: { name: string; website?: string }) => {
  const [error, setError] = useState(false);
  
  // Safe fallback for name to prevent null pointer errors
  const safeName = name || "Company";
  
  const getDomain = () => {
    const manualMapping: Record<string, string> = {
      "ibm": "ibm.com",
      "infosys": "infosys.com",
      "tata consultancy services": "tcs.com",
      "tcs": "tcs.com",
      "accenture": "accenture.com",
      "amazon": "amazon.com",
      "google": "google.com",
      "microsoft": "microsoft.com",
      "american express": "americanexpress.com",
      "amex": "americanexpress.com",
      "beaconfire inc.": "beaconfire.com",
      "beaconfire": "beaconfire.com",
      "bnsf railway": "bnsf.com",
      "ge vernova": "gevernova.com",
      "ge": "ge.com",
      "thomson reuters": "thomsonreuters.com",
    };

    const normalizedName = safeName.toLowerCase().trim();
    if (manualMapping[normalizedName]) return manualMapping[normalizedName];

    if (website && website.length > 3) {
      try {
        const url = website.startsWith('http') ? website : `https://${website}`;
        return new URL(url).hostname.replace(/^www\./, '');
      } catch {
        // ignore
      }
    }
    return `${safeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  };

  const domain = getDomain();
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

  return (
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-border shadow-sm shrink-0 p-1">
      {!error ? (
        <img 
          src={logoUrl} 
          alt={safeName} 
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            if (e.currentTarget.src !== fallbackUrl) {
              e.currentTarget.src = fallbackUrl;
            } else {
              setError(true);
            }
          }}
        />
      ) : (
        <span className="text-[10px] font-bold text-primary">
          {safeName.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

interface SponsorshipTableProps {
  jobs: Job[];
  loading?: boolean;
  pageSize?: number;
}

export const SponsorshipTable = ({ jobs, loading = false, pageSize = 30 }: SponsorshipTableProps) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const sortedJobs = useMemo(() => {
    const sortableJobs = [...jobs];
    if (sortConfig) {
      const { key, direction } = sortConfig;
      sortableJobs.sort((a, b) => {
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableJobs;
  }, [jobs, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedJobs = sortedJobs.slice((safePage - 1) * pageSize, safePage * pageSize);

  const requestSort = (key: keyof Job) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to page 1 on sort
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Loading state
  if (loading) {
    return (
      <Card className="overflow-hidden border-primary/10">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading jobs…</p>
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="overflow-hidden border-primary/10">
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No jobs found for the selected filters.
        </div>
      </Card>
    );
  }

  const PaginationBar = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedJobs.length)}</span> of <span className="font-semibold text-foreground">{sortedJobs.length}</span> jobs
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(1)}
          disabled={safePage === 1}
          className="h-8 px-2 text-xs"
        >
          «
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number pills */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
          .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
            acc.push(p);
            return acc;
          }, [])
          .map((item, i) =>
            item === 'ellipsis' ? (
              <span key={`e-${i}`} className="text-muted-foreground px-1 text-xs">…</span>
            ) : (
              <Button
                key={item}
                variant={item === safePage ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(item as number)}
                className="h-8 w-8 p-0 text-xs"
              >
                {item}
              </Button>
            )
          )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(totalPages)}
          disabled={safePage === totalPages}
          className="h-8 px-2 text-xs"
        >
          »
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden animate-slide-up border-primary/10">
      {/* 🖥️ Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/5 to-accent/5">
            <tr>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => requestSort('companyName')}
              >
                <div className="flex items-center gap-1">Company <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Domain</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Location</th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => requestSort('postedDate')}
              >
                <div className="flex items-center gap-1">Posted <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedJobs.map((job) => (
              <tr
                key={`${job.companyId}-${job.id}`}
                className="hover:bg-accent/5 transition-smooth group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo name={job.companyName} website={job.website} />
                    <span className="font-semibold">{job.companyName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{job.role}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{job.domainName}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{job.location}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(job.postedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth group-hover:scale-105"
                    asChild
                  >
                    <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                      View Job <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Collapsible Table */}
      <div className="block sm:hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/5 to-accent/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Link</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedJobs.map((job) => {
              const isOpen = expandedRow === job.id;
              return (
                <Fragment key={`${job.companyId}-${job.id}`}>
                  <tr className="hover:bg-accent/5 transition-smooth">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={job.companyName} website={job.website} />
                        <span className="font-semibold">{job.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleRow(job.id)} className="text-primary flex items-center gap-1 text-sm">
                        {isOpen ? (<>Hide <ChevronUp className="h-4 w-4" /></>) : (<>View <ChevronDown className="h-4 w-4" /></>)}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 pt-0">
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                        <div className="bg-muted/30 rounded-md p-3 space-y-1 text-sm">
                          <p><span className="font-semibold">Role:</span> {job.role}</p>
                          <p><span className="font-semibold">Domain:</span> {job.domainName}</p>
                          <p><span className="font-semibold">Location:</span> {job.location}</p>
                          <p className="text-xs text-muted-foreground">Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && <PaginationBar />}
    </Card>
  );
};