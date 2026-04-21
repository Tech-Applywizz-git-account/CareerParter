"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Building2 } from "lucide-react";

interface CompanyCardProps {
  id: string;
  name: string;
  sponsored_jobs: number;
  website?: string;
}

export const CompanyCard = ({ id, name, sponsored_jobs, website }: CompanyCardProps) => {
  const [logoError, setLogoError] = useState(false);

  // 🧠 Try to extract domain for logo lookup with manual mapping for common companies
  const getDomain = () => {
    // Manual mapping for famous companies that might have tricky names or websites
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

    const normalizedName = name.toLowerCase().trim();
    if (manualMapping[normalizedName]) return manualMapping[normalizedName];

    if (website && website.length > 3) {
      try {
        const url = website.startsWith('http') ? website : `https://${website}`;
        return new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        // ignore invalid urls
      }
    }
    // Fallback: guess domain from name (lowercase, no spaces)
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  };

  const domain = getDomain();
  // Using Clearbit for clean brand logos, fallback to Google if needed
  const logoUrl = `https://logo.clearbit.com/${domain}`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

  return (
    <Link
      href={`/company-analysis/${encodeURIComponent(id)}`}
      className="block h-full"
    >
      <Card className="p-6 h-full flex flex-col items-center justify-center text-center border hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-primary font-semibold text-xl mb-3 overflow-hidden border border-border shadow-sm p-2 group-hover:border-primary/30 transition-colors">
          {!logoError ? (
            <img 
              src={logoUrl} 
              alt={name} 
              className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
              onError={(e) => {
                // If Clearbit fails, try Google Favicon
                if (e.currentTarget.src !== fallbackUrl) {
                  e.currentTarget.src = fallbackUrl;
                } else {
                  setLogoError(true);
                }
              }}
            />
          ) : (
            <span className="animate-in fade-in zoom-in duration-300">
              {name ? name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>

        {/* Company Name */}
        <h3
          className="font-medium text-base mb-1 max-w-[200px] truncate group-hover:text-primary transition-colors"
          title={name} // tooltip for full name
        >
          {name}
        </h3>

        {/* Sponsored Jobs */}
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          {sponsored_jobs} sponsored job{sponsored_jobs !== 1 ? "s" : ""}
        </p>
      </Card>
    </Link>
  );
};
