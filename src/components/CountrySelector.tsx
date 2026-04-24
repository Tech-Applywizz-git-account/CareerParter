"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useFilters } from "@/contexts/FiltersContext";

export type Country = {
  label: string; // e.g. "India IN"
  value: string; // e.g. "India"
  flag: string;  // e.g. "fi fi-in"
};

interface CountrySelectorProps {
  availableCountries?: Country[];
  selectedCountries?: string[]; // values of selected countries
  onSelectionChange?: (selected: string[]) => void;
  maxVisible?: number;
}

export const CountrySelector = ({
  availableCountries: propsAvailable,
  selectedCountries: propsSelected,
  onSelectionChange: propsOnChange,
  maxVisible = 6,
}: CountrySelectorProps) => {
  const { 
    availableCountries: contextAvailable, 
    selectedCountries: contextSelected, 
    setSelectedCountries 
  } = useFilters();

  const availableCountries = propsAvailable || contextAvailable;
  const selectedValues = propsSelected || contextSelected.map(c => c.value);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    return availableCountries.filter((c) =>
      c.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableCountries, searchQuery]);

  const toggleCountry = (value: string) => {
    let nextValues: string[];
    if (selectedValues.includes(value)) {
      nextValues = selectedValues.filter((v) => v !== value);
    } else {
      nextValues = [...selectedValues, value];
    }

    if (propsOnChange) {
      propsOnChange(nextValues);
    } else {
      const nextCountries = availableCountries.filter(c => nextValues.includes(c.value));
      setSelectedCountries(nextCountries);
    }
  };

  const selectAll = () => {
    const allValues = availableCountries.map((c) => c.value);
    if (propsOnChange) {
      propsOnChange(allValues);
    } else {
      setSelectedCountries(availableCountries);
    }
  };

  const clearAll = () => {
    if (propsOnChange) {
      propsOnChange([]);
    } else {
      setSelectedCountries([]);
    }
  };

  // The first few countries to show as pills
  const visibleCountries = availableCountries.slice(0, maxVisible);
  const remainingCount = Math.max(0, availableCountries.length - maxVisible);

  const selectedCountriesLabel = useMemo(() => {
    if (selectedValues.length === 0) return "No countries selected";
    if (selectedValues.length === availableCountries.length) return "All Countries";
    
    // Get labels for selected values
    return availableCountries
      .filter(c => selectedValues.includes(c.value))
      .map(c => c.label)
      .join(", ");
  }, [selectedValues, availableCountries]);

  return (
    <div className="space-y-4 w-full">
      {/* ─── Summary ─── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing: <span className="font-medium text-foreground">{selectedCountriesLabel}</span>
        </p>
        {selectedValues.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ─── Pills Container ─── */}
      <div className="flex flex-wrap gap-2 items-center">
        {visibleCountries.map((country) => {
          const isSelected = selectedValues.includes(country.value);
          return (
            <button
              key={country.value}
              onClick={() => toggleCountry(country.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-all duration-200 hover:shadow-sm",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-background border-border text-foreground hover:bg-accent"
              )}
            >
              <span className={country.flag} style={{ display: "inline-block", width: "1.33em", height: "1em", backgroundSize: "cover", borderRadius: "2px" }}></span>
              <span className="font-medium whitespace-nowrap">{country.label}</span>
              {isSelected && <X className="h-3 w-3 ml-0.5 opacity-80" />}
            </button>
          );
        })}

        {/* ─── More Button / Dialog ─── */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-4 border-dashed hover:border-primary hover:text-primary transition-colors"
            >
              {remainingCount > 0 ? `+${remainingCount} more` : "Manage"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold">Select Countries</DialogTitle>
            </DialogHeader>

            <div className="px-6 pb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-accent/30 border-none focus-visible:ring-1"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-10 px-3">
                Select All
              </Button>
            </div>

            <div className="max-h-[350px] overflow-y-auto px-2 pb-6 space-y-0.5 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => {
                  const isSelected = selectedValues.includes(country.value);
                  return (
                    <button
                      key={country.value}
                      onClick={() => toggleCountry(country.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 flex items-center justify-center rounded overflow-hidden border border-border/50">
                          <span className={country.flag} style={{ display: "inline-block", width: "1.33em", height: "1em", backgroundSize: "cover" }}></span>
                        </div>
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected ? "text-primary font-bold" : "text-foreground"
                        )}>
                          {country.label}
                        </span>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground scale-110" 
                          : "border-muted-foreground/30 group-hover:border-primary/50"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Globe className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No countries found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-accent/20 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};
