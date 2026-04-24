"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DomainCard } from "@/components/DomainCard";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";
import { Pagination } from "@/components/Pagination";
import { Search } from "lucide-react";

interface Domain {
  id: string;
  name: string;
  category: "tech" | "non-tech";
  jobCount: number;
}

interface APIDomain {
  role: string;
  isTech: boolean;
  jobCount: number;
}

const Domains = () => {
  const { selectedCountries, fromDate, toDate } = useFilters();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [filter, setFilter] = useState<"all" | "tech" | "non-tech">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 48;

  // Re-fetch when country changes
  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const countryValues = selectedCountries.map(c => c.value).join(",");
      const url = `/api/domain?countries=${encodeURIComponent(countryValues)}&from=${fromDate}&to=${toDate}`;
      const res = await fetch(url);
      const data = await res.json();

      // Guard: API may return an error object instead of an array
      if (!Array.isArray(data)) {
        console.error("Unexpected /api/domain response:", data);
        setDomains([]);
        setFilteredDomains([]);
        return;
      }

      const seen = new Set<string>();
      const mapped: Domain[] = data
        .filter((item: APIDomain) => {
          if (seen.has(item.role)) return false;
          seen.add(item.role);
          return true;
        })
        .map((item: APIDomain) => ({
          id: item.role,
          name: item.role,
          category: item.isTech ? "tech" : "non-tech",
          jobCount: item.jobCount || 0,
        }));

      setDomains(mapped);
      setFilteredDomains(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching domains:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCountries, fromDate, toDate]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // 🕒 Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Filter + Search combined
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const newList = domains.filter((domain) => {
      const matchesFilter = filter === "all" || domain.category === filter;
      const matchesSearch = domain.name.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });

    setFilteredDomains(newList);
    setCurrentPage(1); // Reset to first page
  }, [searchTerm, filter, domains]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDomains.length / pageSize);
  const paginatedDomains = useMemo(() => {
    return filteredDomains.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredDomains, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date for display
  const formatDate = (d: string) => {
    if (!d) return "All Time";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 lg:p-5 space-y-4 shadow-sm">
        {/* Country Selector */}
        <CountrySelector />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Date Range */}
        <DateRangePicker />

        {/* Active filter summary */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-muted-foreground">Showing:</span>
          {selectedCountries.map(c => (
              <span key={c.value} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className={c.flag} style={{ display: "inline-block", width: "1.33em", height: "1em", backgroundSize: "cover", borderRadius: "2px" }}></span>
                <span>{c.label}</span>
              </span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-foreground text-xs font-medium">
            {formatDate(fromDate)} → {formatDate(toDate)}
          </span>
        </div>
      </div>

      {/* ── Header + Search + Category Filters ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">All Domains</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Loading..."
              : `${filteredDomains.length} domain${filteredDomains.length !== 1 ? "s" : ""} across ${selectedCountries.length} countries`}
          </p>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search domains..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
            />
          </div>

          <div className="flex bg-muted/50 p-1 rounded-full border border-border">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "tech" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setFilter("tech")}
            >
              Tech
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === "non-tech" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setFilter("non-tech")}
            >
              Non-Tech
            </button>
          </div>
        </div>
      </div>

      {/* ── Domain Cards Grid ───────────────────────────────────────────────── */}
      <div className="space-y-10 pb-10">
        {useMemo(() => (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : paginatedDomains.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all"
              key={filter + selectedCountries.map(c => c.value).join(",") + currentPage}
            >
              {paginatedDomains.map((domain, index) => (
                <DomainCard
                  key={`${domain.id}-${index}`}
                  id={encodeURIComponent(domain.id)}
                  name={domain.name}
                  icon=""
                  category={domain.category}
                  country={selectedCountries.map(c => c.label).join(", ")}
                  fromDate={fromDate}
                  toDate={toDate}
                  jobCount={domain.jobCount} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No domains found</p>
              <p className="text-sm">
                No results for &quot;{searchTerm}&quot; in the selected countries. Try changing filters.
              </p>
            </div>
          )
        ), [loading, paginatedDomains, filter, selectedCountries, currentPage, searchTerm, fromDate, toDate])}

        {!loading && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Domains;
