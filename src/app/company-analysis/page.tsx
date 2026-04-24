"use client";

import { useEffect, useState, useMemo } from "react";
import { CompanyCard } from "@/components/CompanyCard";
import { Search } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useFilters } from "@/contexts/FiltersContext";

import { Pagination } from "@/components/Pagination";

interface Company {
  id: string;
  name: string;
  sponsored_jobs: number;
  website?: string;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 48; // Multiple of 4, 3, 2 and 1 for grid consistency
  const { selectedCountries, fromDate, toDate } = useFilters();

  // 🧠 Fetch companies when filters change
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const countryValues = selectedCountries.map(c => c.value).join(",");
        const url = `/api/company?countries=${encodeURIComponent(countryValues)}&from=${fromDate}&to=${toDate}`;
        const res = await fetch(url);
        const data = await res.json();

        // 🚀 Ensure data is an array before mapping
        const rawData = Array.isArray(data) ? data : [];
        
        interface APICompany {
          company: string;
          sponsored_jobs: number;
          website?: string;
        }

        const mapped = rawData.map((item: APICompany) => ({
          id: item.company,
          name: item.company,
          sponsored_jobs: item.sponsored_jobs,
          website: item.website,
        }));

        setCompanies(mapped);
        setFilteredCompanies(mapped);
        setCurrentPage(1); // Reset to first page
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanies([]);
        setFilteredCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [selectedCountries, fromDate, toDate]);

  // 🕒 Debounce the search input to keep the UI responsive
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // 🔍 Handle search filtering
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    // No need for timeout here as searchTerm is already debounced
    const filtered = companies.filter((company) =>
      company.name.toLowerCase().includes(term),
    );
    setFilteredCompanies(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, companies]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / pageSize);
  const paginatedCompanies = useMemo(() => {
    return filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredCompanies, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {loading ? "Loading..." : `Browse ${filteredCompanies.length} companies offering job opportunities across ${selectedCountries.length} countries`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search companies..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          />
        </div>
      </div>

      {/* Companies Grid - Memoized to prevent re-renders when typing in the search bar */}
      <div className="space-y-8 pb-10">
        {useMemo(() => (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-muted/40 animate-pulse border border-border/50"
                />
              ))}
            </div>
          ) : paginatedCompanies.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all"
              key={selectedCountries.map(c => c.value).join(",") + currentPage} 
            >
              {paginatedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  name={company.name}
                  sponsored_jobs={company.sponsored_jobs}
                  website={company.website}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No companies found matching &quot;{searchTerm}&quot;
            </div>
          )
        ), [loading, paginatedCompanies, searchTerm, selectedCountries, currentPage])}

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

export default CompaniesPage;
