-- V68: Add companyid column to SPVs table
-- Links SPV to a company, required by frontend getCaseById query

ALTER TABLE spvs
ADD COLUMN IF NOT EXISTS companyid UUID REFERENCES companies(id) ON DELETE SET NULL;

COMMENT ON COLUMN spvs.companyid IS 'Reference to the company that owns/manages this SPV';

CREATE INDEX IF NOT EXISTS idx_spvs_companyid ON spvs(companyid);
