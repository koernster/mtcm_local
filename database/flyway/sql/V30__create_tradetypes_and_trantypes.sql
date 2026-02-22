-- Create TradeTypes and TranTypes tables and seed values
CREATE TABLE IF NOT EXISTS TradeTypes (
    ID INT PRIMARY KEY,
    TypeName VARCHAR(55) NOT NULL
);

INSERT INTO TradeTypes (ID, TypeName) VALUES
    (1, 'Subscription'),
    (2, 'Buy'),
    (3, 'Sell')
ON CONFLICT (ID) DO NOTHING;


CREATE TABLE IF NOT EXISTS TranTypes (
    ID INT PRIMARY KEY,
    TypeName VARCHAR(55) NOT NULL
);

INSERT INTO TranTypes (ID, TypeName) VALUES
    (1, 'Created'),
    (2, 'Modified'),
    (3, 'Deleted')
ON CONFLICT (ID) DO NOTHING;
