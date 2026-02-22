-- Create trigger to automatically insert empty row in CaseISINs when new Case is created
-- This ensures every case has at least one associated ISIN record for future updates

-- Create function to handle automatic CaseISIN creation
CREATE OR REPLACE FUNCTION create_empty_case_isin()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert empty row in CaseISINs table with the new CaseID
    INSERT INTO CaseISINs (
        CaseID,
        CreatedAt
    ) VALUES (
        NEW.ID,
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on Cases table for INSERT operations
DO $$ 
BEGIN
    -- Drop existing trigger if it exists
    IF EXISTS (SELECT 1 FROM information_schema.triggers 
               WHERE trigger_name = 'trigger_create_empty_case_isin' 
               AND event_object_table = 'cases') THEN
        DROP TRIGGER trigger_create_empty_case_isin ON Cases;
    END IF;
    
    -- Create the trigger
    CREATE TRIGGER trigger_create_empty_case_isin
        AFTER INSERT ON Cases
        FOR EACH ROW
        EXECUTE FUNCTION create_empty_case_isin();
END $$;

-- Add comment for documentation
COMMENT ON FUNCTION create_empty_case_isin() IS 'Automatically creates an empty CaseISIN record when a new Case is inserted';
COMMENT ON TRIGGER trigger_create_empty_case_isin ON Cases IS 'Trigger to create empty CaseISIN row for each new Case';
