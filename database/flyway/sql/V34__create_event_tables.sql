-- Create event-related tables: PredefinedEventDates, EventTypes, EventWithTypes, EventConfig

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) PredefinedEventDates: stores case-specific predefined event dates
CREATE TABLE IF NOT EXISTS PredefinedEventDates (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CutoffDate TIMESTAMP,
    CaseID UUID NOT NULL,
    CONSTRAINT fk_predefinedeventdates_caseid FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_predefinedeventdates_caseid ON PredefinedEventDates(CaseID);

-- 2) EventTypes: lookup of event types
CREATE TABLE IF NOT EXISTS EventTypes (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Event VARCHAR(100) NOT NULL
);

-- 3) EventWithTypes: mapping between predefined events and their types
CREATE TABLE IF NOT EXISTS EventWithTypes (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    EventID UUID NOT NULL,
    TypeID UUID NOT NULL,
    CONSTRAINT fk_eventwithtypes_eventid FOREIGN KEY (EventID) REFERENCES PredefinedEventDates(ID) ON DELETE CASCADE,
    CONSTRAINT fk_eventwithtypes_typeid FOREIGN KEY (TypeID) REFERENCES EventTypes(ID),
    CONSTRAINT uq_eventwithtypes_event_type UNIQUE (EventID, TypeID)
);

CREATE INDEX IF NOT EXISTS idx_eventwithtypes_eventid ON EventWithTypes(EventID);
CREATE INDEX IF NOT EXISTS idx_eventwithtypes_typeid ON EventWithTypes(TypeID);
-- Optional composite index for frequent lookups by (EventID, TypeID)
CREATE INDEX IF NOT EXISTS idx_eventwithtypes_eventid_typeid ON EventWithTypes(EventID, TypeID);

-- 4) EventConfig: configuration per predefined event
CREATE TABLE IF NOT EXISTS EventConfig (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    CutoffDateSchedule INT,
    EventID UUID NOT NULL,
    CONSTRAINT fk_eventconfig_eventid FOREIGN KEY (EventID) REFERENCES PredefinedEventDates(ID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_eventconfig_eventid ON EventConfig(EventID);
