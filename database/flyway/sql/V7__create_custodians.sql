-- Create Custodians table
CREATE TABLE IF NOT EXISTS Custodians (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Custodian VARCHAR(255) NOT NULL
);