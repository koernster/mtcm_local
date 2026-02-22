-- Create ProcessStatus table
CREATE TABLE IF NOT EXISTS ProcessStatus (
    CaseID UUID REFERENCES Cases(ID) ON DELETE CASCADE,
    Location VARCHAR(255),
    Status VARCHAR(50),
    PRIMARY KEY (CaseID, Location)
);