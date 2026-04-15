"use client";

import { useEffect, useState } from "react";
import { CompanyCard } from "@/components/CompanyCard";
import { Search } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";

interface Company {
  id: string;
  name: string;
  sponsored_jobs: number;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { selectedCountry, fromDate, toDate } = useFilters();

  // 🧠 Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();

        const mapped = data.map((item: any) => ({
          id: item.company,
          name: item.company,
          sponsored_jobs: item.sponsored_jobs,
        }));

        setCompanies(mapped);
        setFilteredCompanies(mapped);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // 🔍 Handle search input
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    // Add a slight delay for smoother typing experience
    const timer = setTimeout(() => {
      setFilteredCompanies(
        companies.filter((company) =>
          company.name.toLowerCase().includes(term),
        ),
      );
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm, companies]);

  // The loading skeletons will be rendered in the main grid below
  // Removing the early return here to keep the header and filter bar visible while loading

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm shadow-sm border border-border rounded-xl p-4 sm:p-6 transition-all duration-300">
        <div className="flex flex-col gap-4">
          <CountrySelector />
          <DateRangePicker />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">All Companies</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `Browse ${filteredCompanies.length} companies offering job opportunities in ${selectedCountry.label}`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted/40 animate-pulse border border-border/50"
            />
          ))}
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all"
          key={searchTerm + selectedCountry.value} // forces a soft reflow animation when search changes
        >
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              sponsored_jobs={company.sponsored_jobs}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No companies found matching &quot;{searchTerm}&quot{" "}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
