-- Create ProductTypes table
CREATE TABLE IF NOT EXISTS ProductTypes (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    TypeName VARCHAR(255) NOT NULL
);