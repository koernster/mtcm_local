-- Delete unused ProductTypes: Digital Assets, Collections, Other Real Assets
-- These product types are no longer needed and should be removed

-- First delete any associated product profiles to avoid foreign key constraint violations
DELETE FROM productprofiles 
WHERE producttypeid IN (
    SELECT ID FROM ProductTypes 
    WHERE TypeName IN ('Digital Assets', 'Collections', 'Other Real Assets')
);

-- Then delete the product types
DELETE FROM ProductTypes 
WHERE TypeName IN ('Digital Assets', 'Collections', 'Other Real Assets');
