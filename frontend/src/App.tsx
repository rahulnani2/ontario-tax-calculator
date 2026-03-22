import React, { useState } from "react";
import TaxResultsPanel, { TaxResult } from "./components/TaxResultsPanel";

interface TaxFormData {
  tax_year: number;
  employment_income: number;
  self_employment_income: number;
  investment_income: number;
  rrsp_contribution: number;
  other_deductions: number;
  other_credits: number;
}

const API_URL = process.env.REACT_APP_API_URL || "";

const App: React.FC = () => {
  const [formData, setFormData] = useState<TaxFormData>({
    tax_year: 2024,
    employment_income: 0,
    self_employment_income: 0,
    investment_income: 0,
    rrsp_contribution: 0,
    other_deductions: 0,
    other_credits: 0,
  });

  const [result, setResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tax_year" ? parseInt(value) : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        const msg = json.details
          ? json.details.map((d: any) => d.message).join(", ")
          : json.error || "Calculation failed";
        setError(msg);
        return;
      }
      setResult({ ...json.data, rrsp_contribution: formData.rrsp_contribution });
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFormData({
      tax_year: 2024,
      employment_income: 0,
      self_employment_income: 0,
      investment_income: 0,
      rrsp_contribution: 0,
      other_deductions: 0,
      other_credits: 0,
    });
  };

  const incomeFields = [
    { name: "employment_income", label: "Employment Income", required: true, hint: "" },
    { name: "self_employment_income", label: "Self-Employment Income", required: false, hint: "" },
    { name: "investment_income", label: "Investment Income", required: false, hint: "" },
  ];

  const deductionFields = [
    { name: "rrsp_contribution", label: "RRSP Contribution", hint: "Max $29,210 for 2024" },
    { name: "other_deductions", label: "Other Deductions", hint: "Union dues, childcare, etc." },
    { name: "other_credits", label: "Other Credits", hint: "Optional tax credits" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f2942 0%, #1a4a7a 50%, #1e3a5f 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{ padding: "40px 24px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 50,
            padding: "8px 20px",
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              For estimation purposes only
            </span>
          </div>
          <h1 style={{
            margin: "0 0 12px",
            fontSize: 42,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}>
            🍁 Ontario Tax Calculator
          </h1>
          <p style={{ margin: "0 0 40px", fontSize: 16, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
            Federal + Provincial income tax estimate for Ontario residents
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* ── Form Card ── */}
        <div style={{
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          overflow: "hidden",
          marginBottom: 28,
        }}>
          {/* Card top accent bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg, #2563eb, #0ea5e9, #10b981)" }} />

          <form onSubmit={handleSubmit} style={{ padding: "36px 40px" }}>

            {/* Tax Year selector — centered */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
              <div style={{ textAlign: "center" }}>
                <label style={{ ...labelStyle, textAlign: "center", display: "block" }}>Tax Year</label>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {[2023, 2024, 2025].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, tax_year: yr }))}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: formData.tax_year === yr ? "2px solid #2563eb" : "2px solid #e2e8f0",
                        background: formData.tax_year === yr ? "#eff6ff" : "#f8fafc",
                        color: formData.tax_year === yr ? "#1d4ed8" : "#64748b",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section label */}
            <p style={sectionLabelStyle}>Income Sources</p>

            {/* Income Fields Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
              {incomeFields.map((field) => (
                <div key={field.name}>
                  <label style={labelStyle}>
                    {field.label}
                    {field.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={dollarStyle}>$</span>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name as keyof TaxFormData] || ""}
                      onChange={handleChange}
                      min={0}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)", margin: "4px 0 28px" }} />

            {/* Section label */}
            <p style={sectionLabelStyle}>Deductions & Credits</p>

            {/* Deduction Fields Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}>
              {deductionFields.map((field) => (
                <div key={field.name}>
                  <label style={labelStyle}>{field.label}</label>
                  <div style={{ position: "relative" }}>
                    <span style={dollarStyle}>$</span>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name as keyof TaxFormData] || ""}
                      onChange={handleChange}
                      min={0}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                  {field.hint && (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>{field.hint}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 28,
                color: "#be123c",
                fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Buttons — centered */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading
                    ? "#bfdbfe"
                    : "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 14,
                  padding: "15px 48px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 6px 20px rgba(37,99,235,0.35)",
                  transition: "all 0.2s",
                  letterSpacing: "0.3px",
                }}
              >
                {loading ? "⏳ Calculating..." : "🧮 Calculate Tax"}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: "#f8fafc",
                    color: "#475569",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "15px 36px",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ↺ Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Results Card ── */}
        {result && (
          <div style={{
            background: "#ffffff",
            borderRadius: 24,
            boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            <div style={{ height: 5, background: "linear-gradient(90deg, #10b981, #0ea5e9, #2563eb)" }} />
            <div style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              padding: "20px 40px",
              borderBottom: "1px solid #bbf7d0",
            }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "1.2px" }}>
                ✅ Tax Calculation Results — {formData.tax_year}
              </h2>
            </div>
            <div style={{ padding: "36px 40px" }}>
              <TaxResultsPanel result={result} />
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 36 }}>
          Estimates only — consult a tax professional for accurate filing. Rates based on CRA published brackets.
        </p>
      </main>
    </div>
  );
};

// ─── Shared Styles ───
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const sectionLabelStyle: React.CSSProperties = {
  margin: "0 0 18px",
  fontSize: 11,
  fontWeight: 800,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
};

const dollarStyle: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9ca3af",
  fontSize: 15,
  fontWeight: 600,
  pointerEvents: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  paddingLeft: 32,
  paddingRight: 14,
  paddingTop: 13,
  paddingBottom: 13,
  fontSize: 15,
  color: "#1e293b",
  background: "#f8fafc",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

export default App;