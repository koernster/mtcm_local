-- Migration V42: Add new fields to EventConfig table if they don't exist
DO $$
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventconfig' AND column_name = 'title'
    ) THEN
        ALTER TABLE EventConfig ADD COLUMN title VARCHAR(255);
    END IF;
    
    -- Add template column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventconfig' AND column_name = 'template'
    ) THEN
        ALTER TABLE EventConfig ADD COLUMN template TEXT;
    END IF;
    
    -- Add target column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventconfig' AND column_name = 'target'
    ) THEN
        ALTER TABLE EventConfig ADD COLUMN target VARCHAR;
    END IF;
    
    -- Add targettype column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventconfig' AND column_name = 'targettype'
    ) THEN
        ALTER TABLE EventConfig ADD COLUMN targettype CHAR;
    END IF;
    
    -- Add graphQL column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventconfig' AND column_name = 'graphql'
    ) THEN
        ALTER TABLE EventConfig ADD COLUMN graphQL TEXT;
    END IF;
END $$;

---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for LoanIssuance2Client
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT 'a40e9b04-474d-462b-b4bb-7f54bfbd52df'::UUID, 'LoanIssuance2Client'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'LoanIssuance2Client'
);

-- Insert to config table for LoanIssuance2Client event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -2, -- 2 days cutoff schedule
    'a40e9b04-474d-462b-b4bb-7f54bfbd52df'::UUID,
    'Loan Issuance to Client',
    'Reminder: Loan capital to be transferred to client in 2 working days.',
    'everyone',
    'G',
    ''    
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = 'a40e9b04-474d-462b-b4bb-7f54bfbd52df'::UUID
);
---------------------------------------------------------------------------------

---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for MaturityPayment
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '5e5565af-3727-43e5-930e-423ce8c76184'::UUID, 'MaturityPayment'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'MaturityPayment'
);

-- Insert to config table for MaturityPayment event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -10, -- 10 days cutoff schedule
    '5e5565af-3727-43e5-930e-423ce8c76184'::UUID,
    'Maturity Payment',
    'Upcoming maturity: Compartment @cases.compartmentname@ will repay principal + interest in 10 working days.',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '5e5565af-3727-43e5-930e-423ce8c76184'::UUID
);
---------------------------------------------------------------------------------

---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for InterestPayment
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '268aee8d-a059-4e6f-b8cf-c3ce602a0474'::UUID, 'InterestPayment'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'InterestPayment'
);

-- Insert to config table for InterestPayment event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -10, -- 10 days cutoff schedule
    '268aee8d-a059-4e6f-b8cf-c3ce602a0474'::UUID,
    'Interest Payment',
    'Interest payment due in 10 working days for Compartment @cases.compartmentname@. Please prepare invoice and send out to client',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '268aee8d-a059-4e6f-b8cf-c3ce602a0474'::UUID
);
---------------------------------------------------------------------------------


---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for CouponPayment
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID, 'CouponPayment'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'CouponPayment'
);

-- Insert to config table for CouponPayment event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -3, -- 3 days cutoff schedule
    '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID,
    'Coupon Payment',
    'Coupon payment due in 3 working days for Compartment @cases.compartmentname@. Please check if cash arrived and send out Coupon instruction to Paying Agent',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID
);
---------------------------------------------------------------------------------


---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for CouponPayment
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID, 'CouponPayment'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'CouponPayment'
);

-- Insert to config table for CouponPayment event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -3, -- 3 days cutoff schedule
    '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID,
    'Coupon Payment',
    'Coupon payment due in 3 working days for Compartment @cases.compartmentname@. Please check if cash arrived and send out Coupon instruction to Paying Agent',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '40b85844-0c7d-4da7-b153-e89e12c87a0e'::UUID
);
---------------------------------------------------------------------------------


---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for CompartmentPhase2Issue
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '2c692d25-5ea5-4200-862a-4f3a6bc7185c'::UUID, 'CompartmentPhase2Issue'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'CompartmentPhase2Issue'
);

-- Insert to config table for CompartmentPhase2Issue event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -5, -- 5 days cutoff schedule
    '2c692d25-5ea5-4200-862a-4f3a6bc7185c'::UUID,
    'Compartment Phase Change: Subscription → Issuance',
    'In 5 working days, Compartment @cases.compartmentname@ will move to Issuance phase.\n\nReview open tasks.',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '2c692d25-5ea5-4200-862a-4f3a6bc7185c'::UUID
);
---------------------------------------------------------------------------------


---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for UpdateCompartmentStatus2Maturity
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT 'af034520-fd7b-49b4-a740-181af2d7572a'::UUID, 'UpdateCompartmentStatus2Maturity'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'UpdateCompartmentStatus2Maturity'
);

-- Insert to config table for UpdateCompartmentStatus2Maturity event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    0, -- 0 days cutoff schedule
    'af034520-fd7b-49b4-a740-181af2d7572a'::UUID,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = 'af034520-fd7b-49b4-a740-181af2d7572a'::UUID
);
---------------------------------------------------------------------------------

---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for CompartmentPhase2Maturity
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT 'ce4a76f8-c336-4be8-8be6-531deb11b0d1'::UUID, 'CompartmentPhase2Maturity'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'CompartmentPhase2Maturity'
);

-- Insert to config table for CompartmentPhase2Maturity event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    -10, -- 10 days cutoff schedule
    'ce4a76f8-c336-4be8-8be6-531deb11b0d1'::UUID,
    'Compartment Phase Change: Issuance → Maturity',
    'In 10 working days, Compartment [Name] will reach maturity.\n\nEnsure all steps are complete.',
    'everyone',
    'G',
    'query GetCompartmentName($id: uuid!) {
        cases(where: {id: {_eq: $id}}) {
            compartmentname
        }
    }'
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = 'ce4a76f8-c336-4be8-8be6-531deb11b0d1'::UUID
);
---------------------------------------------------------------------------------

---------------------------------------------------------------------------------
-- Add default data to EventTypes table with fixed UUID for CreateCouponPaymentEntry
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '7482c692-4d54-4b4e-8e27-2ebdd7604789'::UUID, 'CreateCouponPaymentEntry'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'CreateCouponPaymentEntry'
);

-- Insert to config table for CreateCouponPaymentEntry event type
INSERT INTO EventConfig
SELECT 
    uuid_generate_v4(),
    0, -- 0 days cutoff schedule
    '7482c692-4d54-4b4e-8e27-2ebdd7604789'::UUID,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '7482c692-4d54-4b4e-8e27-2ebdd7604789'::UUID
);
---------------------------------------------------------------------------------