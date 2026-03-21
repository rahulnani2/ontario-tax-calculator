-- Ontario Tax Calculator - Database Schema (Azure SQL / SQL Server)
-- This script creates core tables for tax years, brackets, surtax, deductions,
-- credits, and user sessions.

IF OBJECT_ID('dbo.user_sessions', 'U') IS NOT NULL DROP TABLE dbo.user_sessions;
IF OBJECT_ID('dbo.credits', 'U') IS NOT NULL DROP TABLE dbo.credits;
IF OBJECT_ID('dbo.deductions', 'U') IS NOT NULL DROP TABLE dbo.deductions;
IF OBJECT_ID('dbo.ontario_surtax', 'U') IS NOT NULL DROP TABLE dbo.ontario_surtax;
IF OBJECT_ID('dbo.ontario_brackets', 'U') IS NOT NULL DROP TABLE dbo.ontario_brackets;
IF OBJECT_ID('dbo.federal_brackets', 'U') IS NOT NULL DROP TABLE dbo.federal_brackets;
IF OBJECT_ID('dbo.tax_years', 'U') IS NOT NULL DROP TABLE dbo.tax_years;
GO

CREATE TABLE dbo.tax_years (
    id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [year]      INT NOT NULL,
    is_active   BIT NOT NULL CONSTRAINT DF_tax_years_is_active DEFAULT (0),
    CONSTRAINT UQ_tax_years_year UNIQUE ([year])
);
GO

CREATE TABLE dbo.federal_brackets (
    id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tax_year_id  INT NOT NULL,
    min_income   DECIMAL(18,2) NOT NULL,
    max_income   DECIMAL(18,2) NULL,
    rate         DECIMAL(9,6) NOT NULL,
    CONSTRAINT FK_federal_brackets_tax_year
        FOREIGN KEY (tax_year_id) REFERENCES dbo.tax_years(id)
        ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_federal_brackets_tax_year
    ON dbo.federal_brackets (tax_year_id, min_income);
GO

CREATE TABLE dbo.ontario_brackets (
    id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tax_year_id  INT NOT NULL,
    min_income   DECIMAL(18,2) NOT NULL,
    max_income   DECIMAL(18,2) NULL,
    rate         DECIMAL(9,6) NOT NULL,
    CONSTRAINT FK_ontario_brackets_tax_year
        FOREIGN KEY (tax_year_id) REFERENCES dbo.tax_years(id)
        ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_ontario_brackets_tax_year
    ON dbo.ontario_brackets (tax_year_id, min_income);
GO

CREATE TABLE dbo.ontario_surtax (
    id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tax_year_id  INT NOT NULL,
    threshold_1  DECIMAL(18,2) NOT NULL,
    threshold_2  DECIMAL(18,2) NULL,
    rate_1       DECIMAL(9,6) NOT NULL,
    rate_2       DECIMAL(9,6) NULL,
    CONSTRAINT FK_ontario_surtax_tax_year
        FOREIGN KEY (tax_year_id) REFERENCES dbo.tax_years(id)
        ON DELETE CASCADE
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UQ_ontario_surtax_tax_year
    ON dbo.ontario_surtax (tax_year_id);
GO

CREATE TABLE dbo.deductions (
    id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tax_year_id  INT NOT NULL,
    [name]       NVARCHAR(200) NOT NULL,
    slug         NVARCHAR(100) NOT NULL,
    max_amount   DECIMAL(18,2) NULL,
    [description] NVARCHAR(1000) NULL,
    CONSTRAINT FK_deductions_tax_year
        FOREIGN KEY (tax_year_id) REFERENCES dbo.tax_years(id)
        ON DELETE CASCADE,
    CONSTRAINT UQ_deductions_tax_year_slug
        UNIQUE (tax_year_id, slug)
);
GO

CREATE NONCLUSTERED INDEX IX_deductions_tax_year
    ON dbo.deductions (tax_year_id);
GO

CREATE TABLE dbo.credits (
    id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    tax_year_id   INT NOT NULL,
    [name]        NVARCHAR(200) NOT NULL,
    slug          NVARCHAR(100) NOT NULL,
    amount        DECIMAL(18,2) NOT NULL,
    is_refundable BIT NOT NULL CONSTRAINT DF_credits_is_refundable DEFAULT (0),
    CONSTRAINT FK_credits_tax_year
        FOREIGN KEY (tax_year_id) REFERENCES dbo.tax_years(id)
        ON DELETE CASCADE,
    CONSTRAINT UQ_credits_tax_year_slug
        UNIQUE (tax_year_id, slug)
);
GO

CREATE NONCLUSTERED INDEX IX_credits_tax_year
    ON dbo.credits (tax_year_id);
GO

CREATE TABLE dbo.user_sessions (
    id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    session_token NVARCHAR(100) NOT NULL,
    inputs_json   NVARCHAR(MAX) NOT NULL,
    results_json  NVARCHAR(MAX) NOT NULL,
    created_at    DATETIME2(0) NOT NULL CONSTRAINT DF_user_sessions_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at    DATETIME2(0) NOT NULL CONSTRAINT DF_user_sessions_updated_at DEFAULT (SYSUTCDATETIME())
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UQ_user_sessions_session_token
    ON dbo.user_sessions (session_token);
GO

CREATE NONCLUSTERED INDEX IX_user_sessions_created_at
    ON dbo.user_sessions (created_at);
GO

