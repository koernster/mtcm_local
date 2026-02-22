-- Add CoponPaymentScheduleID field to Cases table
DO $$ 
BEGIN
    -- Add CoponPaymentScheduleID column to Cases table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cases' AND column_name = 'coponpaymentscheduleid') THEN
        ALTER TABLE Cases ADD COLUMN CoponPaymentScheduleID UUID REFERENCES CoponPaymentScheduleTypes(ID) ON DELETE SET NULL;
    END IF;
END $$;
