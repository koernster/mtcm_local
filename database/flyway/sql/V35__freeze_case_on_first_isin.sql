-- V35: Add CASE_FREEZED status and freeze case on first ISIN creation

--    Note: RLS is enabled on Status with a read-only policy; temporarily disable RLS to insert
DO $$
BEGIN
    -- Temporarily disable RLS to allow insert during migration
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'status' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        EXECUTE 'ALTER TABLE Status DISABLE ROW LEVEL SECURITY';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM Status WHERE ID = 10) THEN
        INSERT INTO Status (ID, Status, Description, StatusType)
        VALUES (10, 'CASE_FREEZED', 'Case is Freezed on First ISIN Creation.', 1);
    END IF;

    -- Re-enable RLS after insert
    EXECUTE 'ALTER TABLE Status ENABLE ROW LEVEL SECURITY';
END $$;

-- 2) Trigger to set Cases.ProductSetupStatusID to 10 upon creation of the first ISIN for a case
--    This freezes the case when the first CaseISINs row is inserted for that CaseID
CREATE OR REPLACE FUNCTION freeze_case_on_first_isin()
RETURNS TRIGGER AS $$
DECLARE
    has_existing_isin BOOLEAN;
BEGIN
    -- Check if there are any existing ISINs for this case prior to inserting the new one
    SELECT EXISTS(SELECT 1 FROM CaseISINs WHERE CaseID = NEW.CaseID) INTO has_existing_isin;

    -- If none exist yet, this is the first one: freeze the case
    IF NOT has_existing_isin THEN
        UPDATE Cases
        SET compartmentstatusid = 10
        WHERE ID = NEW.CaseID;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (idempotent: drop if exists, then create)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_freeze_case_on_first_isin' 
          AND event_object_table = 'caseisins'
    ) THEN
        DROP TRIGGER trigger_freeze_case_on_first_isin ON CaseISINs;
    END IF;

    CREATE TRIGGER trigger_freeze_case_on_first_isin
        BEFORE INSERT ON CaseISINs
        FOR EACH ROW
        EXECUTE FUNCTION freeze_case_on_first_isin();
END $$;

-- Documentation
COMMENT ON FUNCTION freeze_case_on_first_isin() IS 'On first ISIN creation for a case, set Cases.ProductSetupStatusID to 10 (CASE_FREEZED).';
