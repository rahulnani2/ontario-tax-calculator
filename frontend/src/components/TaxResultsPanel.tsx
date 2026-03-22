import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface BracketBreakdown {
  bracket: string;
  rate: number;
  tax_amount: number;
}

export interface TaxResult {
  gross_income: number;
  net_income: number;
  federal_tax: number;
  ontario_tax: number;
  ontario_surtax: number;
  cpp_contribution: number;
  ei_premium: number;
  total_tax: number;
  total_deductions: number;
  effective_tax_rate: number;
  marginal_tax_rate: number;
  take_home_income: number;
  rrsp_contribution?: number;
  bracket_breakdown: BracketBreakdown[];
}

interface TaxResultsPanelProps {
  result: TaxResult;
}

const formatCAD = (value: number): string =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);

const formatPct = (value: number): string => `${(value * 100).toFixed(2)}%`;

// ─── Summary Card ───
const SummaryCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  accent: string;
  bg: string;
  textColor: string;
}> = ({ label, value, subtext, accent, bg, textColor }) => (
  <div style={{
    background: bg,
    borderRadius: 16,
    padding: "20px 24px",
    borderLeft: `4px solid ${accent}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  }}>
    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
      {label}
    </p>
    <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: textColor, fontFamily: "monospace" }}>
      {value}
    </p>
    {subtext && <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{subtext}</p>}
  </div>
);

// ─── Custom Tooltip ───
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e293b",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ margin: "4px 0", fontSize: 13, color: entry.fill, fontWeight: 700, fontFamily: "monospace" }}>
            {entry.name}: {formatCAD(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TaxResultsPanel: React.FC<TaxResultsPanelProps> = ({ result }) => {
  const {
    gross_income,
    net_income,
    federal_tax,
    ontario_tax,
    ontario_surtax,
    cpp_contribution,
    ei_premium,
    total_tax,
    total_deductions,
    effective_tax_rate,
    marginal_tax_rate,
    take_home_income,
    rrsp_contribution = 0,
    bracket_breakdown,
  } = result;

  const showHighTaxTip = effective_tax_rate > 0.3;
  const showRrspTip = rrsp_contribution < gross_income * 0.18;
  const rrspRoomRemaining = Math.max(0, Math.min(29210, gross_income * 0.18) - rrsp_contribution);

  // ── Chart data — one bar group per category ──
  const chartData = [
    { name: "Gross Income", amount: gross_income, fill: "#94a3b8" },
    { name: "Total Tax", amount: total_tax, fill: "#f43f5e" },
    { name: "Take-Home", amount: take_home_income, fill: "#10b981" },
  ];

  const breakdownRows = [
    { label: "Federal Tax", value: federal_tax, color: "#f43f5e" },
    { label: "Ontario Tax", value: ontario_tax, color: "#fb923c" },
    { label: "Ontario Surtax", value: ontario_surtax, color: "#fbbf24" },
    { label: "CPP Contribution", value: cpp_contribution, color: "#a78bfa" },
    { label: "EI Premium", value: ei_premium, color: "#818cf8" },
    { label: "Total Deductions", value: total_deductions, color: "#38bdf8" },
    { label: "Net Income (after deductions)", value: net_income, color: "#10b981", bold: true },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        <SummaryCard
          label="Gross Income"
          value={formatCAD(gross_income)}
          subtext={`Marginal: ${formatPct(marginal_tax_rate)}`}
          accent="#94a3b8" bg="#f8fafc" textColor="#1e293b"
        />
        <SummaryCard
          label="Total Tax"
          value={formatCAD(total_tax)}
          subtext={`Effective: ${formatPct(effective_tax_rate)}`}
          accent="#f43f5e" bg="#fff1f2" textColor="#be123c"
        />
        <SummaryCard
          label="Take-Home"
          value={formatCAD(take_home_income)}
          subtext={`${((take_home_income / gross_income) * 100).toFixed(1)}% of gross`}
          accent="#10b981" bg="#f0fdf4" textColor="#15803d"
        />
        <SummaryCard
          label="Effective Rate"
          value={formatPct(effective_tax_rate)}
          subtext={`Marginal: ${formatPct(marginal_tax_rate)}`}
          accent="#3b82f6" bg="#eff6ff" textColor="#1d4ed8"
        />
      </div>

      {/* ── Chart — Fixed ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={sectionLabel}>Income vs Tax vs Take-Home</p>
        <div style={{
          background: "#f8fafc",
          borderRadius: 16,
          padding: "24px 16px 16px",
          border: "1px solid #e2e8f0",
        }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar
                dataKey="amount"
                radius={[8, 8, 0, 0]}
                maxBarSize={80}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Manual colour legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 8 }}>
            {chartData.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: item.fill }} />
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tax Breakdown Table ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={sectionLabel}>Tax Breakdown</p>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={thStyle}>Component</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                <th style={{ ...thStyle, textAlign: "right" }}>% of Gross</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? "#ffffff" : "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontWeight: row.bold ? 700 : 400, color: row.bold ? "#0f172a" : "#374151" }}>
                      {row.label}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: row.color }}>
                    {formatCAD(row.value)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "#94a3b8", fontFamily: "monospace" }}>
                    {gross_income > 0 ? `${((row.value / gross_income) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bracket Breakdown ── */}
      {bracket_breakdown && bracket_breakdown.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <p style={sectionLabel}>Federal Bracket Breakdown</p>
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Bracket</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Rate</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {bracket_breakdown.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>{row.bracket}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", color: "#3b82f6", fontWeight: 600 }}>
                      {(row.rate * 100).toFixed(2)}%
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", color: "#f43f5e", fontWeight: 600 }}>
                      {formatCAD(row.tax_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={2} style={{ ...tdStyle, fontWeight: 700, color: "#1e293b" }}>Total Tax</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#be123c" }}>
                    {formatCAD(total_tax)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Savings Tips ── */}
      {(showHighTaxTip || showRrspTip) && (
        <div>
          <p style={sectionLabel}>Tax Saving Tips</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {showHighTaxTip && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 14 }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#92400e", fontSize: 14 }}>High Effective Tax Rate</p>
                  <p style={{ margin: 0, color: "#a16207", fontSize: 13 }}>
                    Your effective rate exceeds 30%. Consider increasing your RRSP contribution to reduce taxable income and lower your bracket.
                  </p>
                </div>
              </div>
            )}
            {showRrspTip && rrspRoomRemaining > 0 && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 14 }}>
                <span style={{ fontSize: 20 }}>📊</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e40af", fontSize: 14 }}>RRSP Room Available</p>
                  <p style={{ margin: 0, color: "#1d4ed8", fontSize: 13 }}>
                    You have approximately <strong style={{ fontFamily: "monospace" }}>{formatCAD(rrspRoomRemaining)}</strong> in estimated RRSP contribution room remaining. Maximizing this could reduce your federal and provincial tax.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Shared Styles ───
const sectionLabel: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 11,
  fontWeight: 800,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
};

const thStyle: React.CSSProperties = {
  padding: "12px 18px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
};

const tdStyle: React.CSSProperties = {
  padding: "13px 18px",
  color: "#374151",
};

export default TaxResultsPanel;