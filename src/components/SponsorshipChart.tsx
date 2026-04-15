import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  company: string;
  count: number;
}

interface SponsorshipChartProps {
  data: ChartData[];
}

export const SponsorshipChart = ({ data }: SponsorshipChartProps) => {
  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-primary mb-1">
          Top Companies by Sponsorship Jobs
        </h3>
        <p className="text-muted-foreground text-sm">
          Companies ranked by number of sponsorship opportunities
        </p>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 13, right: 30, left: 0, bottom: 10 }} // ⬅️ more left margin
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--accent))"
                  stopOpacity={1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted/30"
              horizontal={true}
              vertical={false}
            />

            <XAxis
              type="number"
              className="text-xs font-medium"
              stroke="hsl(var(--muted-foreground))"
            />

            <YAxis
              dataKey="company"
              type="category"
              width={100} // ensures labels don't get clipped
              tick={{
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              cursor={{ fill: "hsl(var(--muted)/0.05)" }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].value} Sponsored Jobs
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[0, 12, 12, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
