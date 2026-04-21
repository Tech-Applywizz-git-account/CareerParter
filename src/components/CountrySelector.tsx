"use client";

import { COUNTRIES, Country, useFilters } from "@/contexts/FiltersContext";

export const CountrySelector = () => {
  const { selectedCountry, setSelectedCountry, availableCountries } = useFilters();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        🌍 Global Markets
      </p>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {availableCountries.map((country) => {
          const isActive = selectedCountry.value === country.value;
          return (
            <button
              key={country.value}
              onClick={() => setSelectedCountry(country)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary hover:scale-105"
              }`}
            >
              <span className={`text-lg leading-none ${country.flag} rounded-[2px]`}></span>
              <span>{country.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
