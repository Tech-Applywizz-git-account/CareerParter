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
  { label: "United Arab Emirates UAE", value: "United Arab Emirates",     flag: "fi fi-ae" },
  { label: "Canada CA",              value: "Canada",                   flag: "fi fi-ca" },
  { label: "India IN",               value: "India",                    flag: "fi fi-in" },
  { label: "Japan JP",               value: "Japan",                    flag: "fi fi-jp" },
];

// ─── Context type ────────────────────────────────────────────────────────────
interface FiltersState {
  selectedCountry: Country;
  fromDate: string;
  toDate: string;
  setSelectedCountry: (c: Country) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
}

const FiltersContext = createContext<FiltersState>({
  selectedCountry: COUNTRIES[0],
  fromDate: "",
  toDate: "",
  setSelectedCountry: () => {},
  setFromDate: () => {},
  setToDate: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setCountryState] = useState<Country>(COUNTRIES[0]);
  const [fromDate, setFromState] = useState<string>("");
  const [toDate, setToState] = useState<string>("");

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
      value={{ selectedCountry, fromDate, toDate, setSelectedCountry, setFromDate, setToDate }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => useContext(FiltersContext);
