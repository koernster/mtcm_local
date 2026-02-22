CREATE TABLE IF NOT EXISTS CoponFrequencies (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Frequency VARCHAR(255) NOT NULL
);