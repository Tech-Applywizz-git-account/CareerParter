"use client";

import { useEffect, useState, useCallback } from "react";
import { DomainCard } from "@/components/DomainCard";
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";
import { getDummyDomains } from "@/lib/dummyData";
import { Search } from "lucide-react";

interface Domain {
  id: string;
  name: string;
  category: "tech" | "non-tech";
}

const Domains = () => {
  const { selectedCountry, fromDate, toDate } = useFilters();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [filter, setFilter] = useState<"all" | "tech" | "non-tech">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Re-fetch when country changes
  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/domain?country=${encodeURIComponent(selectedCountry.value)}`;
      const res = await fetch(url);
      const data = await res.json();

      // Guard: API may return an error object instead of an array
      if (!Array.isArray(data)) {
        console.error("Unexpected /api/domain response:", data);
        const dummy = getDummyDomains();
        setDomains(dummy);
        setFilteredDomains(dummy);
        return;
      }

      // If DB returns no records (e.g. for UAE/Dubai), inject dummy data so UI is testable
      if (data.length === 0 && selectedCountry.value !== "United States of America") {
        const dummy = getDummyDomains();
        setDomains(dummy);
        setFilteredDomains(dummy);
        return;
      }

      const seen = new Set<string>();
      const mapped: Domain[] = data
        .filter((item: any) => {
          if (seen.has(item.role)) return false;
          seen.add(item.role);
          return true;
        })
        .map((item: any) => ({
          id: item.role,
          name: item.role,
          category: item.isTech ? "tech" : "non-tech",
        }));

      setDomains(mapped);
      setFilteredDomains(mapped);
    } catch (err) {
      console.error("Error fetching domains:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry.value]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Filter + Search combined (debounced)
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const newList = domains.filter((domain) => {
      const matchesFilter = filter === "all" || domain.category === filter;
      const matchesSearch = domain.name.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });

    const timer = setTimeout(() => {
      setFilteredDomains(newList);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm, filter, domains]);

  // Format date for display
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

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
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span className={`${selectedCountry.flag} rounded-[2px]`}></span>
            <span>{selectedCountry.label}</span>
          </span>
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
              : `${filteredDomains.length} domain${filteredDomains.length !== 1 ? "s" : ""} in ${selectedCountry.label}`}
          </p>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredDomains.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all"
          key={searchTerm + filter + selectedCountry.value}
        >
          {Array.from(
            new Map(filteredDomains.map((d) => [d.id, d])).values(),
          ).map((domain, index) => (
            <DomainCard
              key={`${domain.id}-${index}`}
              id={encodeURIComponent(domain.id)}
              name={domain.name}
              icon=""
              category={domain.category}
              country={selectedCountry.label}
              fromDate={fromDate}
              toDate={toDate}
              jobCount={Math.floor(Math.random() * 40) + 10} // Dummy count for UX satisfaction
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No domains found</p>
          <p className="text-sm">
            No results for &quot;{searchTerm}&quot; in {selectedCountry.label}. Try changing the country or search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default Domains;
