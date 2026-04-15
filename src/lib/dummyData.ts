export interface DummyDomain {
  id: string;
  name: string;
  category: "tech" | "non-tech";
}

export interface DummyJob {
  id: number;
  companyName: string;
  companyId: string;
  domainName: string;
  role: string;
  location: string;
  postedDate: string;
  jobLink: string;
  sponsorship: boolean;
}

export const DUMMY_DOMAINS: DummyDomain[] = [
  { id: ".Net", name: ".Net", category: "tech" },
  { id: "AI/ML", name: "AI/ML", category: "tech" },
  { id: "Backend", name: "Backend", category: "tech" },
  { id: "Frontend", name: "Frontend", category: "tech" },
  { id: "Data Science", name: "Data Science", category: "tech" },
  { id: "Cybersecurity", name: "Cybersecurity", category: "tech" },
  { id: "Product Manager", name: "Product Manager", category: "non-tech" },
  { id: "HR Operations", name: "HR Operations", category: "non-tech" },
  { id: "Digital Marketing", name: "Digital Marketing", category: "non-tech" },
  { id: "Sales Executive", name: "Sales Executive", category: "non-tech" },
  { id: "Business Analyst", name: "Business Analyst", category: "tech" },
  { id: "DevOps", name: "DevOps", category: "tech" },
];

const COMPANIES = [
  "Amazon",
  "Google",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Supabase",
  "Vercel",
  "Linear",
  "Notion",
  "Airbnb",
];

const LOCATIONS: Record<string, string[]> = {
  "United States of America": ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Canada: ["Toronto, ON", "Vancouver, BC", "Montreal, QC"],
  India: ["Bangalore", "Hyderabad", "Pune", "Gurgaon"],
  Japan: ["Tokyo", "Osaka", "Kyoto"],
};

export function getDummyDomains() {
  return DUMMY_DOMAINS;
}

export function generateDummyJobs(
  roleName: string,
  country: string,
  count: number = Math.floor(Math.random() * 20) + 5
): DummyJob[] {
  const jobs: DummyJob[] = [];
  const locations = LOCATIONS[country] || ["Remote"];

  // Generate dates primarily within the last 14 days
  for (let i = 0; i < count; i++) {
    const today = new Date();
    // 80% chance the job was posted in the last 14 days to ensure it hits default filters
    const daysAgo = Math.random() > 0.2 ? Math.floor(Math.random() * 14) : Math.floor(Math.random() * 60) + 15;
    const postedDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    jobs.push({
      id: i + 1,
      companyName: company,
      companyId: `comp-${company.toLowerCase()}`,
      domainName: roleName,
      role: `Senior ${roleName} Engineer`, // Simplified title
      location: location,
      postedDate: postedDate,
      jobLink: "#",
      sponsorship: true,
    });
  }

  // Sort by newest first
  return jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
}
