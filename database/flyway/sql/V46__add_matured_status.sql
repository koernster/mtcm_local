-- Add MATURED status to Status table
-- ID: 11, Status: MATURED, Description: Product is Matured, StatusType: 1 (CompartmentStatus)

-- Insert MATURED status record if it doesn't exist
INSERT INTO Status (ID, Status, Description, StatusType) 
SELECT 11, 'MATURED', 'Product is Matured', 1
WHERE NOT EXISTS (SELECT 1 FROM Status WHERE ID = 11);