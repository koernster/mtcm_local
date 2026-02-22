-- Migration V38: Update EventConfig table structure and add default EventTypes data

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add default data to EventTypes table with fixed UUID
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '550e8400-e29b-41d4-a716-446655440001'::UUID, 'UpdateCouponInterestRate'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'UpdateCouponInterestRate'
);

-- Step 2: Modify EventConfig table structure
-- First, add the new EventTypeID column
ALTER TABLE EventConfig 
ADD COLUMN IF NOT EXISTS EventTypeID UUID;

-- Step 3: Add foreign key constraint to EventTypes
ALTER TABLE EventConfig 
ADD CONSTRAINT fk_eventconfig_eventtypeid 
FOREIGN KEY (EventTypeID) REFERENCES EventTypes(ID);

-- Step 4: Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_eventconfig_eventtypeid ON EventConfig(EventTypeID);

-- Step 5: Drop the old foreign key constraint and column
ALTER TABLE EventConfig 
DROP CONSTRAINT IF EXISTS fk_eventconfig_eventid;

ALTER TABLE EventConfig 
DROP COLUMN IF EXISTS EventID;

-- Step 6: Create a sample entry in EventConfig that references the new event type
-- Only insert if no entry exists for this event type
INSERT INTO EventConfig (ID, CutoffDateSchedule, EventTypeID)
SELECT 
    uuid_generate_v4(),
    0, -- 0 days cutoff schedule
    '550e8400-e29b-41d4-a716-446655440001'::UUID
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '550e8400-e29b-41d4-a716-446655440001'::UUID
);

-- Add default data to EventTypes table with fixed UUID for UpdateCompartmentStatus
-- Using a fixed UUID so frontend can reference it consistently
INSERT INTO EventTypes (ID, Event) 
SELECT '550e8400-e29b-41d4-a716-446655440002'::UUID, 'UpdateCompartmentStatus'
WHERE NOT EXISTS (
    SELECT 1 FROM EventTypes WHERE Event = 'UpdateCompartmentStatus'
);

-- Insert to config table for UpdateCompartmentStatus event type
INSERT INTO EventConfig (ID, CutoffDateSchedule, EventTypeID)
SELECT 
    uuid_generate_v4(),
    0, -- 0 days cutoff schedule
    '550e8400-e29b-41d4-a716-446655440002'::UUID
WHERE NOT EXISTS (
    SELECT 1 FROM EventConfig 
    WHERE EventTypeID = '550e8400-e29b-41d4-a716-446655440002'::UUID
);
