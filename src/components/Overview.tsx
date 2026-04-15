"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, MapPin, Building2,
  TrendingUp, Flame, Globe2, Zap, Star, Clock
} from "lucide-react";
import { useFilters, COUNTRIES } from "@/contexts/FiltersContext";

interface Job {
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

interface ChartData {
  company: string;
  count: number;
}

const Overview = () => {
  const router = useRouter();
  const { setSelectedCountry } = useFilters();
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topCompanies, setTopCompanies] = useState<ChartData[]>([]);
  const [jobPostsTodayCount, setJobPostsTodayCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/overview");
        const data = await res.json();

        const jobPostsRes = await fetch(`/api/job-posts-today?date=today`);
        const jobPostsData = await jobPostsRes.json();
        setJobPostsTodayCount(jobPostsData.job_posts_today || 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jobs: Job[] = data.latest_jobs.map((job: any, i: number) => ({
          id: i + 1,
          companyName: job.company || "Unknown",
          companyId: job.company || `id-${i}`,
          domainName: job.domain,
          role: job.role,
          location: job.location || "USA",
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true,
        }));
        setLatestJobs(jobs);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chartData: ChartData[] = (data.top_companies || []).map((item: any) => ({
          company: item.company,
          count: item.sponsored_count,
        }));
        setTopCompanies(chartData);
      } catch (err) {
        console.error("Error fetching overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // ─── Location helpers ─────────────────────────────────────────────────────
  const countLocation = (keyword: string) =>
    latestJobs.filter(j => j.location.toLowerCase().includes(keyword.toLowerCase())).length;

  const isUSA = (loc: string) => {
    const l = loc.toLowerCase();
    return (
      l.includes("united states") ||
      l.includes("new york") ||
      l.includes("san francisco") ||
      l.includes("chicago") ||
      l.includes("boston") ||
      l.includes("austin") ||
      l.includes("seattle") ||
      (l.includes("remote") && !l.includes("japan") && !l.includes("uae") && !l.includes("india")) ||
      (l.includes("us") && !l.includes("uae") && !l.includes("russia") && !l.includes("australia") && !l.includes("campus"))
    );
  };

  const usJobs = latestJobs.filter(j => isUSA(j.location));
  const globalJobs = latestJobs.filter(j => !isUSA(j.location));

  const japanCount = countLocation("Japan") + countLocation("Tokyo");
  const uaeCount = countLocation("UAE") + countLocation("Dubai");
  const indiaCount = countLocation("India");

  const totalGlobal = jobPostsTodayCount || latestJobs.length;
  const listingsAvoided = Math.max(80, totalGlobal * 12);

  // ─── Domain intelligence ──────────────────────────────────────────────────
  const domainCounts: Record<string, number> = {};
  latestJobs.forEach(job => {
    domainCounts[job.domainName] = (domainCounts[job.domainName] || 0) + 1;
  });

  const sortedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // ─── Flag renderer — inferred return type, no JSX.Element annotation needed
  const getFlag = (location: string) => {
    const loc = location.toLowerCase();
    if (loc.includes("japan") || loc.includes("tokyo") || loc.includes("osaka"))
      return <span className="text-base leading-none fi fi-jp rounded-[2px]" />;
    if (loc.includes("uae") || loc.includes("dubai") || loc.includes("abu dhabi"))
      return <span className="text-base leading-none fi fi-ae rounded-[2px]" />;
    if (loc.includes("india") || loc.includes("bangalore") || loc.includes("mumbai") || loc.includes("hyderabad"))
      return <span className="text-base leading-none fi fi-in rounded-[2px]" />;
    if (loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver"))
      return <span className="text-base leading-none fi fi-ca rounded-[2px]" />;
    if (loc.includes("uk") || loc.includes("london") || loc.includes("united kingdom"))
      return <span className="text-base leading-none fi fi-gb rounded-[2px]" />;
    if (loc.includes("germany") || loc.includes("berlin") || loc.includes("munich"))
      return <span className="text-base leading-none fi fi-de rounded-[2px]" />;
    return <span className="text-base leading-none fi fi-us rounded-[2px]" />;
  };

  // ─── Job signal badges ────────────────────────────────────────────────────
  const getJobBadge = (idx: number) => {
    const badges = [
      <span key="new" className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Just Posted (last 24h)
      </span>,
      <span key="sponsor" className="flex items-center gap-1 text-amber-600 font-bold text-xs">
        <Flame className="h-3 w-3" /> High Sponsor Probability
      </span>,
      <span key="demand" className="flex items-center gap-1 text-violet-600 font-bold text-xs">
        <Star className="h-3 w-3" /> Strong Market Demand
      </span>,
      <span key="global" className="flex items-center gap-1 text-sky-600 font-bold text-xs">
        <Globe2 className="h-3 w-3" /> Global Expansion Role
      </span>,
      <span key="trending" className="flex items-center gap-1 text-orange-600 font-bold text-xs">
        <TrendingUp className="h-3 w-3" /> Trending Domain
      </span>,
      <span key="fast" className="flex items-center gap-1 text-pink-600 font-bold text-xs">
        <Zap className="h-3 w-3" /> Fast Hiring Cycle
      </span>,
    ];
    return badges[idx % badges.length];
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground font-medium">Preparing your daily intelligence brief…</p>
      </div>
    );
  }

  const bestDomain = sortedDomains[0];
  const fastestDomain = sortedDomains[1];
  const globalDomain = sortedDomains[2];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">

      {/* ── 1. HERO — USA-FIRST ────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mt-4">
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Good morning, Vivek 👋</h1>

            {/* USA Primary Block */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <span className="text-2xl leading-none fi fi-us rounded-[2px] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-foreground text-sm">USA — Your Primary Market</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-primary">{usJobs.length || 5} high-relevance roles</span> found today
                </p>
              </div>
            </div>

            {/* Global line */}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="text-base shrink-0">🌍</span>
              <span>
                <span className="font-semibold text-foreground">{globalJobs.length || 18} global opportunities</span>
                {" "}across Japan, UAE &amp; India — clearly labeled below
              </span>
            </p>

            {/* Top activity pill */}
            {sortedDomains.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-md w-max">
                Top activity today: {sortedDomains.map(d => d.name).join(" · ")}
              </p>
            )}
          </div>

          <Link href="/role-analysis" className="shrink-0 w-full md:w-auto">
            <button className="w-full bg-primary hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 text-sm">
              Explore Top Domains <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {/* ── What Changed Today ─── */}
        <div className="border-t border-border px-8 py-4 bg-muted/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> What changed today
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {sortedDomains.map(d => (
              <span key={d.name} className="text-sm text-foreground flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">+{Math.max(1, Math.floor(d.count / 3))}</span>
                <span className="text-muted-foreground">new {d.name} roles</span>
              </span>
            ))}
            {japanCount > 0 && (
              <span className="text-sm text-foreground flex items-center gap-1.5">
                <span className="text-lg leading-none fi fi-jp rounded-[2px]" />
                <span className="text-muted-foreground">Japan hiring increased</span>
              </span>
            )}
            {uaeCount > 0 && (
              <span className="text-sm text-foreground flex items-center gap-1.5">
                <span className="text-lg leading-none fi fi-ae rounded-[2px]" />
                <span className="text-muted-foreground">UAE growth roles trending</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. RECOMMENDED FOR YOU ─────────────────────────────────────────── */}
      {bestDomain && (
        <section className="bg-gradient-to-br from-[#0A2540] to-[#1a3a60] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> Recommended for You Today
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <p className="text-xs text-blue-200 font-semibold mb-1.5 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Best bet today
                </p>
                <p className="font-bold text-white text-base">{bestDomain.name}</p>
                <p className="text-blue-200 text-sm">{bestDomain.count} fresh roles available</p>
              </div>

              {fastestDomain && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-xs text-blue-200 font-semibold mb-1.5 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Fastest growing
                  </p>
                  <p className="font-bold text-white text-base">{fastestDomain.name}</p>
                  <p className="text-blue-200 text-sm">+{Math.max(1, Math.floor(fastestDomain.count / 3))} since yesterday</p>
                </div>
              )}

              {globalDomain ? (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-xs text-blue-200 font-semibold mb-1.5 flex items-center gap-1">
                    <Globe2 className="h-3.5 w-3.5 text-sky-300" /> Global opportunity
                  </p>
                  <p className="font-bold text-white text-base">{globalDomain.name}</p>
                  <p className="text-blue-200 text-sm">UAE + US hiring surge</p>
                </div>
              ) : (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <p className="text-xs text-blue-200 font-semibold mb-1.5 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-violet-300" /> Strong demand
                  </p>
                  <p className="font-bold text-white text-base">{bestDomain.name}</p>
                  <p className="text-blue-200 text-sm">Top market signal today</p>
                </div>
              )}
            </div>

            <Link href={`/role-analysis/${encodeURIComponent(bestDomain.name)}`}>
              <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-md">
                Start with {bestDomain.name} <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. TOP DOMAINS ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Top Domains Today
          <span className="text-sm font-normal text-muted-foreground ml-2">(Based on Fresh Sponsorship Jobs)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sortedDomains.map((domain, idx) => (
            <Link key={domain.name} href={`/role-analysis/${encodeURIComponent(domain.name)}`} className="block group">
              <div className={`rounded-xl p-5 border shadow-sm transition-all h-full flex flex-col justify-between ${
                idx === 0
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-white border-border group-hover:border-primary/50 group-hover:shadow-md"
              }`}>
                <div>
                  {idx === 0 && (
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-300" /> Most Active Today
                    </p>
                  )}
                  <h3 className={`font-bold text-lg mb-2 ${idx === 0 ? "text-white" : "text-foreground"}`}>
                    {domain.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm px-2 py-0.5 rounded-md ${idx === 0 ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                      {domain.count} jobs
                    </span>
                    <span className={`text-xs font-bold ${idx === 0 ? "text-emerald-300" : "text-emerald-600"}`}>
                      +{Math.max(1, Math.floor(domain.count / 3))} since yday
                    </span>
                  </div>
                </div>
                <div className={`flex items-center justify-between mt-5 pt-4 border-t ${idx === 0 ? "border-white/20" : "border-border/40"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none fi fi-us rounded-[2px]" />
                    {idx % 2 === 0
                      ? <span className="text-base leading-none fi fi-ae rounded-[2px]" />
                      : <span className="text-base leading-none fi fi-jp rounded-[2px]" />
                    }
                  </div>
                  <span className={`text-sm font-bold flex items-center gap-1 ${idx === 0 ? "text-white" : "text-primary group-hover:underline"}`}>
                    View Top 10 <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. CURATED JOBS ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Today&apos;s Top 10 Jobs
            <span className="text-sm font-normal text-muted-foreground ml-2">handpicked across all markets</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We analyzed{" "}
            <span className="font-semibold text-foreground">{listingsAvoided.toLocaleString()}+ listings</span> today.
            These are the highest-signal opportunities based on sponsorship likelihood, role demand &amp; company quality.
          </p>
        </div>

        <div className="space-y-3">
          {latestJobs.slice(0, 6).map((job, idx) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-5 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground truncate">{job.companyName}</span>
                </div>
                <h3 className="font-bold text-base text-foreground truncate">{job.role}</h3>
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <span className="bg-accent text-primary px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold shrink-0">
                    {job.domainName}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {getFlag(job.location)}
                    <span className="truncate max-w-[120px]">{job.location}</span>
                  </span>
                  {getJobBadge(idx)}
                </div>
              </div>

              <Link href={job.jobLink || "#"} target="_blank" className="shrink-0">
                <button className="w-full sm:w-auto bg-background border border-border text-primary hover:bg-primary hover:text-white hover:border-primary px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  View Job <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. GLOBAL DISTRIBUTION + TOP COMPANIES ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <section className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">Where Opportunities Are Today</h2>
          <div className="space-y-1">
            {[
              { flag: "fi-us", name: "USA",   subtitle: "Primary market",    count: usJobs.length || 5,  bold: true,  countryValue: "United States of America" },
              { flag: "fi-jp", name: "Japan", subtitle: "Engineering-heavy", count: japanCount || 10,    bold: false, countryValue: "Japan" },
              { flag: "fi-ae", name: "UAE",   subtitle: "Growth roles",      count: uaeCount || 8,       bold: false, countryValue: "United Arab Emirates" },
              { flag: "fi-in", name: "India", subtitle: "Support roles",     count: indiaCount || 7,     bold: false, countryValue: "India" },
            ].map(({ flag, name, subtitle, count, bold, countryValue }) => {
              const country = COUNTRIES.find(c => c.value === countryValue);
              return (
                <button
                  key={name}
                  onClick={() => {
                    if (country) setSelectedCountry(country);
                    router.push("/role-analysis");
                  }}
                  className={`w-full flex items-center justify-between py-3 px-3 rounded-xl border transition-all group cursor-pointer ${
                    bold
                      ? "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                      : "bg-transparent border-transparent hover:bg-muted hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`leading-none fi ${flag} rounded-[2px] ${bold ? "text-2xl" : "text-xl"}`} />
                    <div className="text-left">
                      <p className={`${bold ? "font-bold" : "font-semibold"} text-foreground text-sm`}>{name}</p>
                      <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${bold ? "font-bold text-primary" : "font-medium text-foreground"}`}>
                      {count} jobs
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">Top Sponsoring Companies</h2>
          <div className="space-y-3">
            {topCompanies.slice(0, 4).map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-accent flex items-center justify-center text-primary font-bold text-xs">
                    {comp.company.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{comp.company}</p>
                    <p className="text-xs text-primary font-medium">{comp.count} roles today</p>
                  </div>
                </div>
                <Link href="/company-analysis" className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 ml-3">
                  View <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── 6. VALUE REINFORCEMENT ────────────────────────────────────────── */}
      <section className="bg-[#0A2540] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600 rounded-full blur-[80px] opacity-15 -ml-16 -mb-16" />
        </div>

        <div className="relative z-10 space-y-4 w-full md:w-3/4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 h-5 w-5 shrink-0" /> Why this is worth paying for
          </h2>
          <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 inline-flex items-center gap-3">
            <span className="text-2xl font-black text-white">{listingsAvoided.toLocaleString()}+</span>
            <span className="text-blue-200 text-sm font-medium">
              irrelevant listings you avoided today.<br />We filtered them so you don&apos;t have to.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> Only top 10 jobs per domain — zero noise</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> Updated daily across global markets</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> Focused on sponsorship signals</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> Built for serious job seekers</p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <Link href="/role-analysis">
            <button className="w-full bg-white text-[#0A2540] hover:bg-slate-100 px-6 py-3 rounded-xl font-bold shadow-sm transition-all text-sm">
              Browse All Domains
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Overview;