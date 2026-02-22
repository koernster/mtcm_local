-- Create Companies table
CREATE TABLE IF NOT EXISTS Companies (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    HBID VARCHAR(255) UNIQUE NOT NULL,
    CompanyName VARCHAR(255) NOT NULL,
    Address TEXT
);