-- Create CompanyChangeHistory table
CREATE TABLE IF NOT EXISTS CompanyChangeHistory (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CaseID UUID REFERENCES Cases(ID) ON DELETE CASCADE,
    OldHBID VARCHAR(255),
    NewHBID VARCHAR(255),
    OldCompanyName VARCHAR(255),
    NewCompanyName VARCHAR(255),
    OldAddress TEXT,
    NewAddress TEXT
);


