-- Create DocumentsAndArchive table
CREATE TABLE IF NOT EXISTS DocumentsAndArchive (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CaseID UUID REFERENCES Cases(ID) ON DELETE CASCADE,
    IsEditable BOOLEAN DEFAULT FALSE,
    DocumentType VARCHAR(255),
    SharepointLink TEXT
);