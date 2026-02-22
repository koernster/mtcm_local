-- Create SPVs table with one-to-many relationship to Cases
CREATE TABLE IF NOT EXISTS SPVs (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    SPVTitle VARCHAR(255) NOT NULL,
    SPVDescription TEXT,
    SPVWebsite VARCHAR(500)
);

-- Add SPV foreign key to Cases table if it doesn't exist
DO $$ 
BEGIN
    -- Add SPVID column to Cases table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cases' AND column_name = 'spvid') THEN
        ALTER TABLE Cases ADD COLUMN SPVID UUID REFERENCES SPVs(ID) ON DELETE SET NULL;
    END IF;
END $$;

-- Insert default SPV records only if table is empty
INSERT INTO SPVs (SPVTitle, SPVDescription, SPVWebsite) 
SELECT * FROM (VALUES
    ('ABS Securitisation SA', 'ABS Securitisation SA is a bank independent and insolvency protected securitisation platform in Luxembourg based on the securitisation law of 22 March 2004, as amended. Our securitisations can be defined as the solution between initiator and investor requirements and the regulatory framework.', 'https://abssecuritisation.com/'),
    ('Orbis Securitisation SA', 'Orbis Securitisation SA is a bank independent and insolvency protected securitisation platform in Luxembourg based on the securitisation law of 22 March 2004, as amended. Our securitisations can be defined as the solution between initiator and investor requirements and the regulatory framework.', 'https://orbissecuritisation.com/'),
    ('Altius Securitisation SA', 'Altius Securitisation SA is a bank independent and insolvency protected securitisation platform in Luxembourg based on the securitisation law of 22 March 2004, as amended. Our securitisations can be defined as the solution between initiator and investor requirements and the regulatory framework.', 'http://altiussecuritisation.com/')
) AS new_values(SPVTitle, SPVDescription, SPVWebsite)
WHERE NOT EXISTS (SELECT 1 FROM SPVs);
