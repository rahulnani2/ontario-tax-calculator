-- Ontario Tax Calculator - Seed Data
-- NOTE: Using 2024 rates as placeholders for 2023, 2024, and 2025.
-- This script assumes the schema in db/schema/schema.sql has been created.

SET NOCOUNT ON;
GO

-- Clear existing data (respecting FK order)
DELETE FROM dbo.user_sessions;
DELETE FROM dbo.credits;
DELETE FROM dbo.deductions;
DELETE FROM dbo.ontario_surtax;
DELETE FROM dbo.ontario_brackets;
DELETE FROM dbo.federal_brackets;
DELETE FROM dbo.tax_years;
GO

-- Insert tax years
INSERT INTO dbo.tax_years ([year], is_active)
VALUES
    (2023, 0),
    (2024, 1),
    (2025, 0);
GO

DECLARE @tax_year_id_2023 INT;
DECLARE @tax_year_id_2024 INT;
DECLARE @tax_year_id_2025 INT;

SELECT @tax_year_id_2023 = id FROM dbo.tax_years WHERE [year] = 2023;
SELECT @tax_year_id_2024 = id FROM dbo.tax_years WHERE [year] = 2024;
SELECT @tax_year_id_2025 = id FROM dbo.tax_years WHERE [year] = 2025;

-----------------------------------------------------------------------
-- Federal brackets (Canada) - using 2024 rates for all years
-----------------------------------------------------------------------

-- 2023 federal brackets
INSERT INTO dbo.federal_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2023, 0.00,      55867.00,   0.150000),
    (@tax_year_id_2023, 55867.00,  111733.00,  0.205000),
    (@tax_year_id_2023, 111733.00, 154906.00,  0.260000),
    (@tax_year_id_2023, 154906.00, 220000.00,  0.290000),
    (@tax_year_id_2023, 220000.00, NULL,       0.330000);

-- 2024 federal brackets
INSERT INTO dbo.federal_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2024, 0.00,      55867.00,   0.150000),
    (@tax_year_id_2024, 55867.00,  111733.00,  0.205000),
    (@tax_year_id_2024, 111733.00, 154906.00,  0.260000),
    (@tax_year_id_2024, 154906.00, 220000.00,  0.290000),
    (@tax_year_id_2024, 220000.00, NULL,       0.330000);

-- 2025 federal brackets (placeholder: same as 2024)
INSERT INTO dbo.federal_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2025, 0.00,      55867.00,   0.150000),
    (@tax_year_id_2025, 55867.00,  111733.00,  0.205000),
    (@tax_year_id_2025, 111733.00, 154906.00,  0.260000),
    (@tax_year_id_2025, 154906.00, 220000.00,  0.290000),
    (@tax_year_id_2025, 220000.00, NULL,       0.330000);
GO

-----------------------------------------------------------------------
-- Ontario provincial brackets - using 2024 rates for all years
-----------------------------------------------------------------------

-- 2023 Ontario brackets
INSERT INTO dbo.ontario_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2023, 0.00,      51446.00,   0.050500),
    (@tax_year_id_2023, 51446.00,  102894.00,  0.091500),
    (@tax_year_id_2023, 102894.00, 150000.00,  0.111600),
    (@tax_year_id_2023, 150000.00, 220000.00,  0.121600),
    (@tax_year_id_2023, 220000.00, NULL,       0.131600);

-- 2024 Ontario brackets
INSERT INTO dbo.ontario_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2024, 0.00,      51446.00,   0.050500),
    (@tax_year_id_2024, 51446.00,  102894.00,  0.091500),
    (@tax_year_id_2024, 102894.00, 150000.00,  0.111600),
    (@tax_year_id_2024, 150000.00, 220000.00,  0.121600),
    (@tax_year_id_2024, 220000.00, NULL,       0.131600);

-- 2025 Ontario brackets (placeholder: same as 2024)
INSERT INTO dbo.ontario_brackets (tax_year_id, min_income, max_income, rate)
VALUES
    (@tax_year_id_2025, 0.00,      51446.00,   0.050500),
    (@tax_year_id_2025, 51446.00,  102894.00,  0.091500),
    (@tax_year_id_2025, 102894.00, 150000.00,  0.111600),
    (@tax_year_id_2025, 150000.00, 220000.00,  0.121600),
    (@tax_year_id_2025, 220000.00, NULL,       0.131600);
GO

-----------------------------------------------------------------------
-- Ontario surtax - using 2024 thresholds for all years
-- 20% surtax on Ontario tax above $5,315
-- Additional 36% surtax on Ontario tax above $6,802
-----------------------------------------------------------------------

-- 2023 surtax
INSERT INTO dbo.ontario_surtax (tax_year_id, threshold_1, threshold_2, rate_1, rate_2)
VALUES
    (@tax_year_id_2023, 5315.00, 6802.00, 0.200000, 0.360000);

-- 2024 surtax
INSERT INTO dbo.ontario_surtax (tax_year_id, threshold_1, threshold_2, rate_1, rate_2)
VALUES
    (@tax_year_id_2024, 5315.00, 6802.00, 0.200000, 0.360000);

-- 2025 surtax (placeholder: same as 2024)
INSERT INTO dbo.ontario_surtax (tax_year_id, threshold_1, threshold_2, rate_1, rate_2)
VALUES
    (@tax_year_id_2025, 5315.00, 6802.00, 0.200000, 0.360000);
GO

-----------------------------------------------------------------------
-- Common deductions
-- Using generic max_amounts / descriptions as placeholders.
-----------------------------------------------------------------------

-- 2023 deductions
INSERT INTO dbo.deductions (tax_year_id, [name], slug, max_amount, [description])
VALUES
    (@tax_year_id_2023, N'RRSP Contributions',    N'rrsp',           NULL,          N'Registered Retirement Savings Plan contributions. Annual limit depends on income.'),
    (@tax_year_id_2023, N'TFSA Note',             N'tfsa-note',      NULL,          N'Tax-Free Savings Account contributions (tracked separately, not a deduction).'),
    (@tax_year_id_2023, N'Union Dues',           N'union-dues',     NULL,          N'Annual union or professional dues.'),
    (@tax_year_id_2023, N'Childcare Expenses',    N'childcare',      NULL,          N'Eligible childcare expenses.'),
    (@tax_year_id_2023, N'Moving Expenses',       N'moving-expenses',NULL,          N'Eligible moving expenses for work or school moves.');

-- 2024 deductions
INSERT INTO dbo.deductions (tax_year_id, [name], slug, max_amount, [description])
VALUES
    (@tax_year_id_2024, N'RRSP Contributions',    N'rrsp',           NULL,          N'Registered Retirement Savings Plan contributions. Annual limit depends on income.'),
    (@tax_year_id_2024, N'TFSA Note',             N'tfsa-note',      NULL,          N'Tax-Free Savings Account contributions (tracked separately, not a deduction).'),
    (@tax_year_id_2024, N'Union Dues',           N'union-dues',     NULL,          N'Annual union or professional dues.'),
    (@tax_year_id_2024, N'Childcare Expenses',    N'childcare',      NULL,          N'Eligible childcare expenses.'),
    (@tax_year_id_2024, N'Moving Expenses',       N'moving-expenses',NULL,          N'Eligible moving expenses for work or school moves.');

-- 2025 deductions (placeholder: same as 2024)
INSERT INTO dbo.deductions (tax_year_id, [name], slug, max_amount, [description])
VALUES
    (@tax_year_id_2025, N'RRSP Contributions',    N'rrsp',           NULL,          N'Registered Retirement Savings Plan contributions. Annual limit depends on income.'),
    (@tax_year_id_2025, N'TFSA Note',             N'tfsa-note',      NULL,          N'Tax-Free Savings Account contributions (tracked separately, not a deduction).'),
    (@tax_year_id_2025, N'Union Dues',           N'union-dues',     NULL,          N'Annual union or professional dues.'),
    (@tax_year_id_2025, N'Childcare Expenses',    N'childcare',      NULL,          N'Eligible childcare expenses.'),
    (@tax_year_id_2025, N'Moving Expenses',       N'moving-expenses',NULL,          N'Eligible moving expenses for work or school moves.');
GO

-----------------------------------------------------------------------
-- Common credits
-- Federal Basic Personal Amount (placeholder): 15,705
-- Ontario Basic Personal (placeholder): 11,865
-- Ontario Tax Reduction (placeholder amount)
-----------------------------------------------------------------------

-- 2023 credits
INSERT INTO dbo.credits (tax_year_id, [name], slug, amount, is_refundable)
VALUES
    (@tax_year_id_2023, N'Federal Basic Personal Amount',  N'federal-basic-personal',    15705.00, 0),
    (@tax_year_id_2023, N'Ontario Basic Personal Amount',  N'ontario-basic-personal',    11865.00, 0),
    (@tax_year_id_2023, N'Ontario Tax Reduction',          N'ontario-tax-reduction',     0.00,     0);

-- 2024 credits
INSERT INTO dbo.credits (tax_year_id, [name], slug, amount, is_refundable)
VALUES
    (@tax_year_id_2024, N'Federal Basic Personal Amount',  N'federal-basic-personal',    15705.00, 0),
    (@tax_year_id_2024, N'Ontario Basic Personal Amount',  N'ontario-basic-personal',    11865.00, 0),
    (@tax_year_id_2024, N'Ontario Tax Reduction',          N'ontario-tax-reduction',     0.00,     0);

-- 2025 credits (placeholder: same as 2024)
INSERT INTO dbo.credits (tax_year_id, [name], slug, amount, is_refundable)
VALUES
    (@tax_year_id_2025, N'Federal Basic Personal Amount',  N'federal-basic-personal',    15705.00, 0),
    (@tax_year_id_2025, N'Ontario Basic Personal Amount',  N'ontario-basic-personal',    11865.00, 0),
    (@tax_year_id_2025, N'Ontario Tax Reduction',          N'ontario-tax-reduction',     0.00,     0);
GO

PRINT 'Seed data inserted for tax years 2023, 2024, and 2025.';
GO

