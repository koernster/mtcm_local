-- Create CaseISINs table with one-to-many relationship to Cases (max 3 per case)
CREATE TABLE IF NOT EXISTS CaseISINs (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CaseID UUID NOT NULL REFERENCES Cases(ID) ON DELETE CASCADE,
    ISINNumber VARCHAR(12),
    Valoren VARCHAR(9),
    IssueSize VARCHAR(255),
    IssuePrice DECIMAL(5,2),
    CurrencyID UUID REFERENCES Currencies(ID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on CaseID for better performance
CREATE INDEX IF NOT EXISTS idx_caseisins_caseid ON CaseISINs(CaseID);

-- Create function to check case ISIN limit
CREATE OR REPLACE FUNCTION check_case_isin_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM CaseISINs WHERE CaseID = NEW.CaseID) >= 3 THEN
        RAISE EXCEPTION 'Cannot add more than 3 ISINs per case. Case ID: %', NEW.CaseID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the 3 ISIN per case limit
DO $$ 
BEGIN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM information_schema.triggers 
               WHERE trigger_name = 'trigger_check_case_isin_limit' 
               AND event_object_table = 'caseisins') THEN
        DROP TRIGGER trigger_check_case_isin_limit ON CaseISINs;
    END IF;
    
    -- Create the trigger
    CREATE TRIGGER trigger_check_case_isin_limit
        BEFORE INSERT ON CaseISINs
        FOR EACH ROW
        EXECUTE FUNCTION check_case_isin_limit();
END $$;
