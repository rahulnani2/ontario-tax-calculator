# 🍁 Ontario Income Tax Calculator

A full-stack 3-tier web application for estimating Ontario provincial and federal income tax. Built as an Azure architecture demo project.

![Architecture](https://img.shields.io/badge/Azure-3--Tier%20Architecture-0078D4?logo=microsoft-azure)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)
![Database](https://img.shields.io/badge/Database-Azure%20SQL-CC2927?logo=microsoft-sql-server)

---

## Architecture

```
Internet (port 80)
      │
      ▼
Frontend VM — Nginx
  │  Serves React static files
  │  Proxies /api/* → Backend VM (private)
      │
      ▼
Backend VM — Node.js + PM2 (port 5000)
  │  Express REST API
  │  Tax calculation engine
      │
      ▼
Azure SQL Database (port 1433, private)
  │  Tax brackets, deductions, credits
  │  User sessions
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Recharts |
| Backend | Node.js 20 + Express + TypeScript + Zod |
| Database | Azure SQL / SQL Server |
| Infra | Azure VMs, VNet, NSGs, Nginx, PM2 |

---

## Features

- Federal + Ontario provincial tax calculation
- Tax year selection (2023, 2024, 2025)
- RRSP, CPP, EI calculations
- Effective vs marginal rate breakdown
- Federal bracket-by-bracket breakdown
- Income vs Tax vs Take-Home bar chart
- Tax saving tips (RRSP room, high effective rate)

---

## Project Structure

```
ontario-tax-calculator/
├── frontend/                 React app
│   ├── src/
│   │   ├── App.tsx           Form + API calls
│   │   └── components/
│   │       └── TaxResultsPanel.tsx
│   ├── .env.example
│   └── package.json
├── backend/                  Express API
│   ├── src/
│   │   ├── server.ts         Entry point
│   │   ├── app.ts            Express setup
│   │   ├── config/
│   │   │   └── azureConfig.ts
│   │   ├── controllers/
│   │   │   └── taxController.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── routes/
│   │   │   └── taxRoutes.ts
│   │   └── services/
│   │       ├── dbService.ts
│   │       └── taxCalculationService.ts
│   ├── .env.example
│   └── package.json
└── db/
    ├── schema.sql            Table definitions
    └── seed.sql              Tax bracket data 2023–2025
```

---

## Local Development

### Prerequisites

- Node.js v20+
- Docker Desktop
- Azure Data Studio (optional, for SQL GUI)

### 1. Start Local SQL Server

```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=YourLocalPassword123!" \
  -e "MSSQL_ENCRYPT=NO" \
  -p 1433:1433 \
  --name ontario-tax-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Create Database and Run Schema

Connect via Azure Data Studio (`localhost,1433` / `sa`) then run:

```sql
CREATE DATABASE ontario_tax_db;
```

Then open and run `db/schema.sql` followed by `db/seed.sql` against `ontario_tax_db`.

### 3. Start Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev
# Running on http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
cp .env.example .env        # set REACT_APP_API_URL=http://localhost:5000
npm install
npm run dev
# Running on http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/api/tax-data/:year` | Brackets, credits, deductions for a year |
| POST | `/api/calculate` | Run tax calculation |

### POST /api/calculate

**Request body:**
```json
{
  "tax_year": 2024,
  "employment_income": 95000,
  "self_employment_income": 0,
  "investment_income": 0,
  "rrsp_contribution": 5000,
  "other_deductions": 0,
  "other_credits": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gross_income": 95000,
    "federal_tax": 14234.50,
    "ontario_tax": 7821.10,
    "cpp_contribution": 3449.25,
    "ei_premium": 1049.12,
    "total_tax": 26554.97,
    "take_home_income": 68445.03,
    "effective_tax_rate": 0.2795,
    "marginal_tax_rate": 0.4341,
    "bracket_breakdown": []
  }
}
```

---

## Deployment

See the full [Build & Deployment Guide](docs/ontario-tax-calculator-guide.docx) for step-by-step Azure VM deployment instructions including:

- VNet and subnet setup
- NSG rules per tier
- Nginx reverse proxy configuration
- PM2 process management
- Azure SQL firewall rules
- Troubleshooting common errors

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `development` / `production` |
| `PORT` | API port | `5000` |
| `DB_SERVER` | SQL Server hostname | `localhost` or Azure FQDN |
| `DB_NAME` | Database name | `ontario_tax_db` |
| `DB_USER` | SQL username | `sa` |
| `DB_PASSWORD` | SQL password | — |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000` (dev) / empty (prod) |

---

## Tax Rates (2024)

| Tax | Rate |
|---|---|
| Federal BPA credit | $15,705 × 15% |
| Ontario BPA credit | $11,865 × 5.05% |
| CPP rate | 5.95% (max pensionable: $68,500) |
| EI rate | 1.66% (max insurable: $63,200) |

> **Disclaimer:** This calculator provides estimates only. Rates are based on CRA published brackets. Consult a tax professional for accurate filing.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using conventional commits: `git commit -m "feat: add PDF export"`
4. Push and open a Pull Request against `main`

---

## License

MIT — free to use for personal and educational purposes.

---

*Built as an Azure 3-tier architecture demo project. Demonstrates VNet subnetting, NSG rules, Nginx reverse proxying, PM2 process management, and Azure SQL connectivity.*