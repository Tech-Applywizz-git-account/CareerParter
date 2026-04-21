"use client";

import { Calendar, Clock } from "lucide-react";
import { useFilters } from "@/contexts/FiltersContext";

export const DateRangePicker = () => {
  const { fromDate, toDate, setFromDate, setToDate } = useFilters();

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromDate(val);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (fromDate && val < fromDate) return; // prevent invalid range
    setToDate(val);
  };

  const applyPreset = (daysBackStart: number, daysBackEnd: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - daysBackStart);
    
    const end = new Date(today);
    end.setDate(today.getDate() - daysBackEnd);
    
    setFromDate(start.toISOString().split('T')[0]);
    setToDate(end.toISOString().split('T')[0]);
  };

  const getDateString = (daysBack: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return d.toISOString().split('T')[0];
  };

  const isToday = fromDate === getDateString(0) && toDate === getDateString(0);
  const isYesterday = fromDate === getDateString(1) && toDate === getDateString(1);
  const isLast7Days = fromDate === getDateString(7) && toDate === getDateString(0);
  const isAll = !fromDate && !toDate;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        Date Range
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        {/* Dates Wrapper */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* FROM */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">From</span>
            <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={handleFromChange}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
          />
        </div>

        <span className="text-muted-foreground font-medium">→</span>

        {/* TO */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">To</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={handleToChange}
            className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
          />
        </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="flex items-center gap-2 pl-0 sm:pl-4 sm:border-l border-border mt-2 sm:mt-0 w-full sm:w-auto sm:ml-auto">
          <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <button 
            onClick={() => { setFromDate(""); setToDate(""); }} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-sm ${
              isAll ? "bg-primary text-primary-foreground border-primary" : "bg-accent/30 hover:bg-accent text-foreground border-border hover:border-primary/50"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => applyPreset(0, 0)} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-sm ${
              isToday ? "bg-primary text-primary-foreground border-primary" : "bg-accent/30 hover:bg-accent text-foreground border-border hover:border-primary/50"
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => applyPreset(1, 1)} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-sm ${
              isYesterday ? "bg-primary text-primary-foreground border-primary" : "bg-accent/30 hover:bg-accent text-foreground border-border hover:border-primary/50"
            }`}
          >
            Yesterday
          </button>
          <button 
            onClick={() => applyPreset(7, 0)} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all shadow-sm ${
              isLast7Days ? "bg-primary text-primary-foreground border-primary" : "bg-accent/30 hover:bg-accent text-foreground border-border hover:border-primary/50"
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>
    </div>
  );
};
