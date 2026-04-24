import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// indeed_search_country value → Full display name + flag
const COUNTRY_MAP: Record<string, { label: string; flag: string }> = {
  USA:               { label: "United States",          flag: "fi fi-us" },
  UK:                { label: "United Kingdom",          flag: "fi fi-gb" },
  UNITEDARABEMIRATES:{ label: "United Arab Emirates",   flag: "fi fi-ae" },
  CANADA:            { label: "Canada",                  flag: "fi fi-ca" },
  INDIA:             { label: "India",                   flag: "fi fi-in" },
  IRELAND:           { label: "Ireland",                 flag: "fi fi-ie" },
  JAPAN:             { label: "Japan",                   flag: "fi fi-jp" },
  GERMANY:           { label: "Germany",                 flag: "fi fi-de" },
  FRANCE:            { label: "France",                  flag: "fi fi-fr" },
  ITALY:             { label: "Italy",                   flag: "fi fi-it" },
  AUSTRALIA:         { label: "Australia",               flag: "fi fi-au" },
  BRAZIL:            { label: "Brazil",                  flag: "fi fi-br" },
  SINGAPORE:         { label: "Singapore",               flag: "fi fi-sg" },
  NETHERLANDS:       { label: "Netherlands",             flag: "fi fi-nl" },
  SPAIN:             { label: "Spain",                   flag: "fi fi-es" },
  COLOMBIA:          { label: "Colombia",                flag: "fi fi-co" },
  INDONESIA:         { label: "Indonesia",               flag: "fi fi-id" },
  MEXICO:            { label: "Mexico",                  flag: "fi fi-mx" },
  SOUTHAFRICA:       { label: "South Africa",            flag: "fi fi-za" },
  SAUDIARABIA:       { label: "Saudi Arabia",            flag: "fi fi-sa" },
  POLAND:            { label: "Poland",                  flag: "fi fi-pl" },
  SWITZERLAND:       { label: "Switzerland",             flag: "fi fi-ch" },
  BELGIUM:           { label: "Belgium",                 flag: "fi fi-be" },
  SWEDEN:            { label: "Sweden",                  flag: "fi fi-se" },
  NORWAY:            { label: "Norway",                  flag: "fi fi-no" },
  DENMARK:           { label: "Denmark",                 flag: "fi fi-dk" },
  FINLAND:           { label: "Finland",                 flag: "fi fi-fi" },
  AUSTRIA:           { label: "Austria",                 flag: "fi fi-at" },
  PORTUGAL:          { label: "Portugal",                flag: "fi fi-pt" },
  GREECE:            { label: "Greece",                  flag: "fi fi-gr" },
  TURKEY:            { label: "Turkey",                  flag: "fi fi-tr" },
  ISRAEL:            { label: "Israel",                  flag: "fi fi-il" },
  ARGENTINA:         { label: "Argentina",               flag: "fi fi-ar" },
  CHILE:             { label: "Chile",                   flag: "fi fi-cl" },
  CHINA:             { label: "China",                   flag: "fi fi-cn" },
  COSTARICA:         { label: "Costa Rica",              flag: "fi fi-cr" },
  CZECHREPUBLIC:     { label: "Czech Republic",          flag: "fi fi-cz" },
  EGYPT:             { label: "Egypt",                   flag: "fi fi-eg" },
  HONGKONG:          { label: "Hong Kong",               flag: "fi fi-hk" },
  HUNGARY:           { label: "Hungary",                 flag: "fi fi-hu" },
  LUXEMBOURG:        { label: "Luxembourg",              flag: "fi fi-lu" },
  MALAYSIA:          { label: "Malaysia",                flag: "fi fi-my" },
  NEWZEALAND:        { label: "New Zealand",             flag: "fi fi-nz" },
  NIGERIA:           { label: "Nigeria",                 flag: "fi fi-ng" },
  PAKISTAN:          { label: "Pakistan",                flag: "fi fi-pk" },
  PHILIPPINES:       { label: "Philippines",             flag: "fi fi-ph" },
  QATAR:             { label: "Qatar",                   flag: "fi fi-qa" },
  TAIWAN:            { label: "Taiwan",                  flag: "fi fi-tw" },
  THAILAND:          { label: "Thailand",                flag: "fi fi-th" },
  UKRAINE:           { label: "Ukraine",                 flag: "fi fi-ua" },
  BAHRAIN:           { label: "Bahrain",                 flag: "fi fi-bh" },
};

// Priority order for display
const PRIORITY = ["USA", "UK", "UNITEDARABEMIRATES", "CANADA", "INDIA", "IRELAND", "JAPAN"];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("jobs_all_roles")
      .select("indeed_search_country")
      .not("indeed_search_country", "is", null);

    if (error) throw error;

    const uniqueCodes = Array.from(
      new Set(data.map(item => item.indeed_search_country?.trim().toUpperCase()).filter(Boolean))
    );

    const countryList = uniqueCodes.map(code => {
      const mapped = COUNTRY_MAP[code];
      return {
        value: code,
        label: mapped?.label || code,
        flag: mapped?.flag || "fi fi-xx",
      };
    });

    // Sort: priority first, then alphabetical by label
    countryList.sort((a, b) => {
      const pa = PRIORITY.indexOf(a.value);
      const pb = PRIORITY.indexOf(b.value);
      if (pa !== -1 && pb !== -1) return pa - pb;
      if (pa !== -1) return -1;
      if (pb !== -1) return 1;
      return a.label.localeCompare(b.label);
    });

    return NextResponse.json(countryList);
  } catch (error: any) {
    console.error("Error in /api/countries:", error);
    return NextResponse.json([], { status: 500 });
  }
}
