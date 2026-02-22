-- Create CaseStatus junction table for many-to-many relationship
-- This table was moved from V1 because it depends on Cases table
CREATE TABLE IF NOT EXISTS CaseStatus (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CaseID UUID NOT NULL,
    StatusID INT NOT NULL,
    CONSTRAINT fk_case_status_case FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE,
    CONSTRAINT fk_case_status_status FOREIGN KEY (StatusID) REFERENCES Status(ID) ON DELETE RESTRICT,
    CONSTRAINT uk_case_status UNIQUE (CaseID, StatusID)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_case_status_case_id ON CaseStatus(CaseID);
CREATE INDEX IF NOT EXISTS idx_case_status_status_id ON CaseStatus(StatusID);
