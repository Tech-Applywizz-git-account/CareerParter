"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Country definitions ────────────────────────────────────────────────────
export type Country = {
  label: string;   // display label e.g. "USA"
  value: string;   // DB value e.g. "United States of America"
  flag: string;    // emoji flag
};

export const COUNTRIES: Country[] = [
  { label: "United States US",       value: "United States of America", flag: "fi fi-us" },
  { label: "United Kingdom UK",      value: "United Kingdom",           flag: "fi fi-gb" },
  { label: "Ireland IE",             value: "Ireland",                  flag: "fi fi-ie" },
  { label: "United Arab Emirates UAE", value: "United Arab Emirates",     flag: "fi fi-ae" },
  { label: "Canada CA",              value: "Canada",                   flag: "fi fi-ca" },
  { label: "India IN",               value: "India",                    flag: "fi fi-in" },
  { label: "Japan JP",               value: "Japan",                    flag: "fi fi-jp" },
];

interface FiltersState {
  selectedCountry: Country;
  availableCountries: Country[];
  fromDate: string;
  toDate: string;
  setSelectedCountry: (c: Country) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
}

const FiltersContext = createContext<FiltersState>({
  selectedCountry: COUNTRIES[0],
  availableCountries: [COUNTRIES[0]],
  fromDate: "",
  toDate: "",
  setSelectedCountry: () => {},
  setFromDate: () => {},
  setToDate: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function FiltersProvider({ children }: { children: ReactNode }) {
  // Helper to get YYYY-MM-DD
  const getISO = (d: Date) => d.toISOString().split("T")[0];

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setDate(now.getDate() - 365); // Default to last 1 year

  const [selectedCountry, setCountryState] = useState<Country>(COUNTRIES[0]);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([COUNTRIES[0]]);
  const [fromDate, setFromState] = useState<string>("");
  const [toDate, setToState] = useState<string>("");

  // Fetch available countries from DB
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await fetch("/api/countries");
        const dbCountryValues = await res.json();
        
        if (Array.isArray(dbCountryValues) && dbCountryValues.length > 0) {
          const filtered = COUNTRIES.filter(c => dbCountryValues.includes(c.value));
          
          // If a country in DB isn't in our master list, add a basic entry for it
          dbCountryValues.forEach(val => {
            if (!COUNTRIES.some(c => c.value === val)) {
              filtered.push({ label: val, value: val, flag: "fi fi-xx" });
            }
          });

          setAvailableCountries(filtered);
          
          // Also check if current selected country is in the available list
          const isSelectedValid = filtered.some(c => c.value === selectedCountry.value);
          if (!isSelectedValid) {
            setCountryState(filtered[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch available countries:", err);
      }
    };
    fetchAvailable();
  }, [selectedCountry.value]);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cp_filters");
      if (!raw) return;
      const saved = JSON.parse(raw);
      const found = COUNTRIES.find((c) => c.value === saved?.country?.value);
      if (found) setCountryState(found);
      if (saved?.fromDate) setFromState(saved.fromDate);
      if (saved?.toDate) setToState(saved.toDate);
    } catch {}
  }, []);

  const persist = (country: Country, from: string, to: string) => {
    try {
      localStorage.setItem(
        "cp_filters",
        JSON.stringify({ country, fromDate: from, toDate: to }),
      );
    } catch {}
  };

  const setSelectedCountry = (c: Country) => {
    setCountryState(c);
    persist(c, fromDate, toDate);
  };

  const setFromDate = (d: string) => {
    setFromState(d);
    if (toDate && d > toDate) setToState(d); // keep range valid
    persist(selectedCountry, d, toDate);
  };

  const setToDate = (d: string) => {
    setToState(d);
    persist(selectedCountry, fromDate, d);
  };

  return (
    <FiltersContext.Provider
      value={{ selectedCountry, availableCountries, fromDate, toDate, setSelectedCountry, setFromDate, setToDate }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => useContext(FiltersContext);
