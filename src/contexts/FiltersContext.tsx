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
  label: string;   // display label e.g. "United States"
  value: string;   // indeed_search_country value e.g. "USA"
  flag: string;    // flag icon class e.g. "fi fi-us"
};

// Fallback master list — value must match indeed_search_country column exactly
export const COUNTRIES: Country[] = [
  { label: "United States",          value: "USA",               flag: "fi fi-us" },
  { label: "United Kingdom",         value: "UK",                flag: "fi fi-gb" },
  { label: "United Arab Emirates",   value: "UNITEDARABEMIRATES", flag: "fi fi-ae" },
  { label: "Canada",                 value: "CANADA",            flag: "fi fi-ca" },
  { label: "India",                  value: "INDIA",             flag: "fi fi-in" },
  { label: "Ireland",                value: "IRELAND",           flag: "fi fi-ie" },
  { label: "Japan",                  value: "JAPAN",             flag: "fi fi-jp" },
  { label: "Germany",                value: "GERMANY",           flag: "fi fi-de" },
  { label: "France",                 value: "FRANCE",            flag: "fi fi-fr" },
  { label: "Italy",                  value: "ITALY",             flag: "fi fi-it" },
  { label: "Australia",              value: "AUSTRALIA",         flag: "fi fi-au" },
  { label: "Brazil",                 value: "BRAZIL",            flag: "fi fi-br" },
  { label: "Singapore",              value: "SINGAPORE",         flag: "fi fi-sg" },
  { label: "Netherlands",            value: "NETHERLANDS",       flag: "fi fi-nl" },
  { label: "Spain",                  value: "SPAIN",             flag: "fi fi-es" },
  { label: "Colombia",               value: "COLOMBIA",          flag: "fi fi-co" },
  { label: "Indonesia",              value: "INDONESIA",         flag: "fi fi-id" },
  { label: "Mexico",                 value: "MEXICO",            flag: "fi fi-mx" },
  { label: "South Africa",           value: "SOUTHAFRICA",       flag: "fi fi-za" },
  { label: "Saudi Arabia",           value: "SAUDIARABIA",       flag: "fi fi-sa" },
  { label: "Poland",                 value: "POLAND",            flag: "fi fi-pl" },
  { label: "Switzerland",            value: "SWITZERLAND",       flag: "fi fi-ch" },
  { label: "Belgium",                value: "BELGIUM",           flag: "fi fi-be" },
  { label: "Sweden",                 value: "SWEDEN",            flag: "fi fi-se" },
  { label: "Norway",                 value: "NORWAY",            flag: "fi fi-no" },
  { label: "Denmark",                value: "DENMARK",           flag: "fi fi-dk" },
  { label: "Finland",                value: "FINLAND",           flag: "fi fi-fi" },
  { label: "Austria",                value: "AUSTRIA",           flag: "fi fi-at" },
  { label: "Portugal",               value: "PORTUGAL",          flag: "fi fi-pt" },
  { label: "Greece",                 value: "GREECE",            flag: "fi fi-gr" },
  { label: "Turkey",                 value: "TURKEY",            flag: "fi fi-tr" },
  { label: "Israel",                 value: "ISRAEL",            flag: "fi fi-il" },
  { label: "Argentina",              value: "ARGENTINA",         flag: "fi fi-ar" },
  { label: "Chile",                  value: "CHILE",             flag: "fi fi-cl" },
  { label: "China",                  value: "CHINA",             flag: "fi fi-cn" },
  { label: "Costa Rica",             value: "COSTARICA",         flag: "fi fi-cr" },
  { label: "Czech Republic",         value: "CZECHREPUBLIC",     flag: "fi fi-cz" },
  { label: "Egypt",                  value: "EGYPT",             flag: "fi fi-eg" },
  { label: "Hong Kong",              value: "HONGKONG",          flag: "fi fi-hk" },
  { label: "Hungary",                value: "HUNGARY",           flag: "fi fi-hu" },
  { label: "Luxembourg",             value: "LUXEMBOURG",        flag: "fi fi-lu" },
  { label: "Malaysia",               value: "MALAYSIA",          flag: "fi fi-my" },
  { label: "New Zealand",            value: "NEWZEALAND",        flag: "fi fi-nz" },
  { label: "Nigeria",                value: "NIGERIA",           flag: "fi fi-ng" },
  { label: "Pakistan",               value: "PAKISTAN",          flag: "fi fi-pk" },
  { label: "Philippines",            value: "PHILIPPINES",       flag: "fi fi-ph" },
  { label: "Qatar",                  value: "QATAR",             flag: "fi fi-qa" },
  { label: "Taiwan",                 value: "TAIWAN",            flag: "fi fi-tw" },
  { label: "Thailand",               value: "THAILAND",          flag: "fi fi-th" },
  { label: "Ukraine",                value: "UKRAINE",           flag: "fi fi-ua" },
  { label: "Bahrain",                value: "BAHRAIN",           flag: "fi fi-bh" },
];

interface FiltersState {
  selectedCountries: Country[];
  availableCountries: Country[];
  fromDate: string;
  toDate: string;
  setSelectedCountries: (countries: Country[]) => void;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
}

const FiltersContext = createContext<FiltersState>({
  selectedCountries: [COUNTRIES[0]],
  availableCountries: COUNTRIES,
  fromDate: "",
  toDate: "",
  setSelectedCountries: () => {},
  setFromDate: () => {},
  setToDate: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [selectedCountries, setSelectedCountriesState] = useState<Country[]>([COUNTRIES[0]]);
  const [availableCountries, setAvailableCountries] = useState<Country[]>(COUNTRIES);
  const [fromDate, setFromState] = useState<string>("");
  const [toDate, setToState] = useState<string>("");

  // Fetch available countries from DB
  // API now returns: [{ value: "USA", label: "United States", flag: "fi fi-us" }, ...]
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await fetch("/api/countries");
        const dbCountries: { value: string; label: string; flag?: string }[] = await res.json();

        if (Array.isArray(dbCountries) && dbCountries.length > 0) {
          const available: Country[] = dbCountries.map(item => {
            const code = item.value?.trim().toUpperCase();
            const known = COUNTRIES.find(c => c.value === code);
            return {
              value: code,
              label: item.label || known?.label || code,
              flag: item.flag || known?.flag || "fi fi-xx",
            };
          });

          setAvailableCountries(available);

          // Validate current selection
          setSelectedCountriesState(prev => {
            const valid = prev.filter(c => available.some(a => a.value === c.value));
            return valid.length > 0 ? valid : [available[0]];
          });
        }
      } catch (err) {
        console.error("Failed to fetch available countries:", err);
      }
    };
    fetchAvailable();
  }, []);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cp_filters");
      if (!raw) return;
      const saved = JSON.parse(raw);

      // Migration: convert old ISO codes or full names → new indeed_search_country values
      const migrate = (val: string): string => {
        const oldToNew: Record<string, string> = {
          "US": "USA", "United States": "USA", "United States of America": "USA",
          "GB": "UK", "United Kingdom": "UK",
          "AE": "UNITEDARABEMIRATES", "United Arab Emirates": "UNITEDARABEMIRATES",
          "CA": "CANADA", "Canada": "CANADA",
          "IN": "INDIA", "India": "INDIA",
          "IE": "IRELAND", "Ireland": "IRELAND",
          "JP": "JAPAN", "Japan": "JAPAN",
        };
        return oldToNew[val] || val.trim().toUpperCase();
      };

      if (Array.isArray(saved?.countries)) {
        const found = saved.countries
          .map((savedC: { value: string }) => {
            const code = migrate(savedC?.value || "");
            return COUNTRIES.find(c => c.value === code);
          })
          .filter(Boolean) as Country[];
        if (found.length > 0) setSelectedCountriesState(found);
      } else if (saved?.country) {
        const code = migrate(saved.country.value || "");
        const found = COUNTRIES.find(c => c.value === code);
        if (found) setSelectedCountriesState([found]);
      }

      if (saved?.fromDate) setFromState(saved.fromDate);
      if (saved?.toDate) setToState(saved.toDate);
    } catch {}
  }, []);

  const persist = (countries: Country[], from: string, to: string) => {
    try {
      localStorage.setItem(
        "cp_filters",
        JSON.stringify({ countries, fromDate: from, toDate: to }),
      );
    } catch {}
  };

  const setSelectedCountries = (cs: Country[]) => {
    setSelectedCountriesState(cs);
    persist(cs, fromDate, toDate);
  };

  const setFromDate = (d: string) => {
    setFromState(d);
    if (toDate && d > toDate) setToState(d);
    persist(selectedCountries, d, toDate);
  };

  const setToDate = (d: string) => {
    setToState(d);
    persist(selectedCountries, fromDate, d);
  };

  return (
    <FiltersContext.Provider
      value={{ selectedCountries, availableCountries, fromDate, toDate, setSelectedCountries, setFromDate, setToDate }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export const useFilters = () => useContext(FiltersContext);
