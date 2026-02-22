-- V44__create_notifications_tables.sql

-- Table: Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    ID UUID PRIMARY KEY,
    Title TEXT NOT NULL,
    Message TEXT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(255) NOT NULL
);

-- Table: NotificationStatus
CREATE TABLE IF NOT EXISTS NotificationStatus (
    ID INT PRIMARY KEY,
    Status VARCHAR(50) NOT NULL
);

-- Insert default values for NotificationStatus (only if they don't exist)
INSERT INTO NotificationStatus (ID, Status) 
SELECT 1, 'Sent' 
WHERE NOT EXISTS (SELECT 1 FROM NotificationStatus WHERE ID = 1);

INSERT INTO NotificationStatus (ID, Status) 
SELECT 2, 'Read' 
WHERE NOT EXISTS (SELECT 1 FROM NotificationStatus WHERE ID = 2);

INSERT INTO NotificationStatus (ID, Status) 
SELECT 3, 'Unread' 
WHERE NOT EXISTS (SELECT 1 FROM NotificationStatus WHERE ID = 3);

INSERT INTO NotificationStatus (ID, Status) 
SELECT 4, 'Archived' 
WHERE NOT EXISTS (SELECT 1 FROM NotificationStatus WHERE ID = 4);

-- Table: NotificationTargets
CREATE TABLE IF NOT EXISTS NotificationTargets (
    NotificationID UUID NOT NULL,
    Type CHAR(1) NOT NULL,
    Target VARCHAR(255) NOT NULL,
    Status INT NOT NULL,
    ChangeBy VARCHAR(255),
    FOREIGN KEY (NotificationID) REFERENCES Notifications(ID),
    FOREIGN KEY (Status) REFERENCES NotificationStatus(ID)
);