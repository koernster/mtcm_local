-- Create Currencies table
CREATE TABLE IF NOT EXISTS Currencies (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CurrencyName VARCHAR(255) NOT NULL,
    CurrencyShortName VARCHAR(10) NOT NULL,
    CountryName VARCHAR(255) NOT NULL
);