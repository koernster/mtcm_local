-- V67: Add new product-specific fields to cases table
-- Based on Excel specification for product field visibility

-- ============================================
-- 1. Add Performance field (ALL products)
-- ============================================
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS performance NUMERIC(18,6);

COMMENT ON COLUMN cases.performance IS 'Expected performance indicator (percentage). Applies to all product types.';

-- ============================================
-- 2. Add Interest Rate field (Private Debt)
-- ============================================
-- Note: This is at case-level, separate from couponinterest.interestrate which is at ISIN level
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS interestrate NUMERIC(18,6);

COMMENT ON COLUMN cases.interestrate IS 'Interest rate charged to the underlying (e.g., loan interest rate). Primarily used for Private Debt products.';

-- ============================================
-- 3. Create AMC Types lookup table
-- ============================================
CREATE TABLE IF NOT EXISTS amctypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    typename VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert AMC Type options: Digital Assets, Shares, Bonds, Equities
INSERT INTO amctypes (typename, description) VALUES
    ('Digital Assets', 'Digital Assets including cryptocurrencies and tokens'),
    ('Shares', 'Company shares and stock'),
    ('Bonds', 'Fixed income securities'),
    ('Equities', 'Equity instruments')
ON CONFLICT (typename) DO NOTHING;

-- Add AMC Type FK to cases
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS amctypeid UUID REFERENCES amctypes(id);

COMMENT ON COLUMN cases.amctypeid IS 'AMC Type selection. Only used for AMC products.';

-- ============================================
-- 4. Create Non-Bankable Types lookup table
-- ============================================
CREATE TABLE IF NOT EXISTS nonbankabletypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    typename VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Non-Bankable Type options: Collectables, Intellectual Properties, Equities Wrapper, Other
INSERT INTO nonbankabletypes (typename, description) VALUES
    ('Collectables', 'Collectible items including art, wine, and memorabilia'),
    ('Intellectual Properties', 'IP rights including patents, trademarks, and copyrights'),
    ('Equities Wrapper', 'Wrapped equity instruments'),
    ('Other', 'Other non-bankable asset types')
ON CONFLICT (typename) DO NOTHING;

-- Add Non-Bankable Type FK to cases
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS nonbankabletypeid UUID REFERENCES nonbankabletypes(id);

COMMENT ON COLUMN cases.nonbankabletypeid IS 'Non-Bankable asset type selection. Only used for Non-Bankable products.';

-- ============================================
-- 5. Create indexes for new columns
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cases_amctypeid ON cases(amctypeid);
CREATE INDEX IF NOT EXISTS idx_cases_nonbankabletypeid ON cases(nonbankabletypeid);
