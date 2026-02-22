-- Insert default values for lookup tables
-- Only inserts if the value doesn't already exist

-- InvestmentTypes
INSERT INTO InvestmentTypes (ID, TypeName)
SELECT 'a1b2c3d4-1111-4e5f-8a9b-1c2d3e4f5a01'::UUID, 'Single'
WHERE NOT EXISTS (
    SELECT 1 FROM InvestmentTypes WHERE TypeName = 'Single'
);

INSERT INTO InvestmentTypes (ID, TypeName)
SELECT 'a1b2c3d4-1111-4e5f-8a9b-1c2d3e4f5a02'::UUID, 'Basket'
WHERE NOT EXISTS (
    SELECT 1 FROM InvestmentTypes WHERE TypeName = 'Basket'
);

-- ProductTypes
INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b01'::UUID, 'Private equity'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Private equity'
);

INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b02'::UUID, 'Private Debt'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Private Debt'
);

INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b03'::UUID, 'Fund'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Fund'
);

INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b04'::UUID, 'Digital Assets'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Digital Assets'
);

INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b05'::UUID, 'Collections'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Collections'
);

INSERT INTO ProductTypes (ID, TypeName)
SELECT 'b2c3d4e5-2222-4f6a-9b0c-2d3e4f5a6b06'::UUID, 'Other Real Assets'
WHERE NOT EXISTS (
    SELECT 1 FROM ProductTypes WHERE TypeName = 'Other Real Assets'
);

-- CoponFrequencies
INSERT INTO CoponFrequencies (ID, Frequency)
SELECT 'c3d4e5f6-3333-4a7b-0c1d-3e4f5a6b7c01'::UUID, 'Monthly'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponFrequencies WHERE Frequency = 'Monthly'
);

INSERT INTO CoponFrequencies (ID, Frequency)
SELECT 'c3d4e5f6-3333-4a7b-0c1d-3e4f5a6b7c02'::UUID, 'Semi-Annual'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponFrequencies WHERE Frequency = 'Semi-Annual'
);

INSERT INTO CoponFrequencies (ID, Frequency)
SELECT 'c3d4e5f6-3333-4a7b-0c1d-3e4f5a6b7c03'::UUID, 'Annually'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponFrequencies WHERE Frequency = 'Annually'
);

INSERT INTO CoponFrequencies (ID, Frequency)
SELECT 'c3d4e5f6-3333-4a7b-0c1d-3e4f5a6b7c04'::UUID, 'Quarterly'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponFrequencies WHERE Frequency = 'Quarterly'
);

INSERT INTO CoponFrequencies (ID, Frequency)
SELECT 'c3d4e5f6-3333-4a7b-0c1d-3e4f5a6b7c05'::UUID, 'Weekly'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponFrequencies WHERE Frequency = 'Weekly'
);

-- CoponTypes
INSERT INTO CoponTypes (ID, TypeName)
SELECT 'd4e5f6a7-4444-4b8c-1d2e-4f5a6b7c8d01'::UUID, 'Fixed'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponTypes WHERE TypeName = 'Fixed'
);

INSERT INTO CoponTypes (ID, TypeName)
SELECT 'd4e5f6a7-4444-4b8c-1d2e-4f5a6b7c8d02'::UUID, 'Floating'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponTypes WHERE TypeName = 'Floating'
);

-- PayAgentTypes
INSERT INTO PayAgentTypes (ID, TypeName)
SELECT 'e5f6a7b8-5555-4c9d-2e3f-5a6b7c8d9e01'::UUID, 'Credinvest'
WHERE NOT EXISTS (
    SELECT 1 FROM PayAgentTypes WHERE TypeName = 'Credinvest'
);

INSERT INTO PayAgentTypes (ID, TypeName)
SELECT 'e5f6a7b8-5555-4c9d-2e3f-5a6b7c8d9e02'::UUID, 'Kaiser'
WHERE NOT EXISTS (
    SELECT 1 FROM PayAgentTypes WHERE TypeName = 'Kaiser'
);

-- CoponPaymentScheduleTypes
INSERT INTO CoponPaymentScheduleTypes (ID, TypeName)
SELECT 'f6a7b8c9-6666-4d0e-3f4a-6b7c8d9e0f01'::UUID, 'Last short'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponPaymentScheduleTypes WHERE TypeName = 'Last short'
);

INSERT INTO CoponPaymentScheduleTypes (ID, TypeName)
SELECT 'f6a7b8c9-6666-4d0e-3f4a-6b7c8d9e0f02'::UUID, 'First long'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponPaymentScheduleTypes WHERE TypeName = 'First long'
);

INSERT INTO CoponPaymentScheduleTypes (ID, TypeName)
SELECT 'f6a7b8c9-6666-4d0e-3f4a-6b7c8d9e0f03'::UUID, 'First short'
WHERE NOT EXISTS (
    SELECT 1 FROM CoponPaymentScheduleTypes WHERE TypeName = 'First short'
);

-- Currencies
INSERT INTO Currencies (ID, CurrencyName, CurrencyShortName, CountryName)
SELECT 'a7b8c9d0-7777-4e1f-4a5b-7c8d9e0f1a01'::UUID, 'Swiss Franc', 'CHF', 'Switzerland'
WHERE NOT EXISTS (
    SELECT 1 FROM Currencies WHERE CurrencyShortName = 'CHF'
);

INSERT INTO Currencies (ID, CurrencyName, CurrencyShortName, CountryName)
SELECT 'a7b8c9d0-7777-4e1f-4a5b-7c8d9e0f1a02'::UUID, 'Euro', 'EUR', 'European Union'
WHERE NOT EXISTS (
    SELECT 1 FROM Currencies WHERE CurrencyShortName = 'EUR'
);

INSERT INTO Currencies (ID, CurrencyName, CurrencyShortName, CountryName)
SELECT 'a7b8c9d0-7777-4e1f-4a5b-7c8d9e0f1a03'::UUID, 'United States Dollar', 'USD', 'United States'
WHERE NOT EXISTS (
    SELECT 1 FROM Currencies WHERE CurrencyShortName = 'USD'
);
