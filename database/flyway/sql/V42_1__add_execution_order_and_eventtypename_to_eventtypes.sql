-- Migration V42.1: Add execution_order and eventtypename fields to EventTypes table

-- Step 1: Add new columns to EventTypes table
ALTER TABLE EventTypes 
ADD COLUMN IF NOT EXISTS execution_order FLOAT,
ADD COLUMN IF NOT EXISTS eventtypename VARCHAR(50);

-- Step 2: Update existing event types with default execution order and event type names
-- UpdateCompartmentStatus: 1.0, EventTypeName: Process
UPDATE EventTypes 
SET execution_order = 1.0, eventtypename = 'Process' 
WHERE Event = 'UpdateCompartmentStatus';

-- UpdateCompartmentStatus2Maturity: 1.1, EventTypeName: Process
UPDATE EventTypes 
SET execution_order = 1.1, eventtypename = 'Process' 
WHERE Event = 'UpdateCompartmentStatus2Maturity';

-- UpdateCouponInterestRate: 2.0, EventTypeName: Process
UPDATE EventTypes 
SET execution_order = 2.0, eventtypename = 'Process' 
WHERE Event = 'UpdateCouponInterestRate';

-- CreateCouponPaymentEntry: 3.0, EventTypeName: Process
UPDATE EventTypes 
SET execution_order = 3.0, eventtypename = 'Process' 
WHERE Event = 'CreateCouponPaymentEntry';

-- CompartmentPhase2Issue: 4.0, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 4.0, eventtypename = 'Notification' 
WHERE Event = 'CompartmentPhase2Issue';

-- CompartmentPhase2Maturity: 4.1, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 4.1, eventtypename = 'Notification' 
WHERE Event = 'CompartmentPhase2Maturity';

-- LoanIssuance2Client: 5.0, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 5.0, eventtypename = 'Notification' 
WHERE Event = 'LoanIssuance2Client';

-- CouponPayment: 6.0, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 6.0, eventtypename = 'Notification' 
WHERE Event = 'CouponPayment';

-- InterestPayment: 6.1, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 6.1, eventtypename = 'Notification' 
WHERE Event = 'InterestPayment';

-- MaturityPayment: 6.2, EventTypeName: Notification
UPDATE EventTypes 
SET execution_order = 6.2, eventtypename = 'Notification' 
WHERE Event = 'MaturityPayment';

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_eventtypes_execution_order ON EventTypes(execution_order);
CREATE INDEX IF NOT EXISTS idx_eventtypes_eventtypename ON EventTypes(eventtypename);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN EventTypes.execution_order IS 'Order in which events should be executed (lower values execute first)';
COMMENT ON COLUMN EventTypes.eventtypename IS 'Category of the event type (Process or Notification)';