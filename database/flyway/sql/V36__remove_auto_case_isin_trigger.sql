-- V36: Remove auto CaseISIN insert trigger on Cases

-- Drop trigger if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_create_empty_case_isin' 
          AND event_object_table = 'cases'
    ) THEN
        DROP TRIGGER trigger_create_empty_case_isin ON Cases;
    END IF;
END $$;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS create_empty_case_isin();

-- Documentation (removed - requires schema ownership)
-- COMMENT ON SCHEMA public IS 'Removed trigger_create_empty_case_isin and create_empty_case_isin() in V36.';
