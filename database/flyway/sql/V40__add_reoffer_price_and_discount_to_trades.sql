-- Add ReofferPrice and Discount columns to Trades table
ALTER TABLE Trades ADD COLUMN ReofferPrice DECIMAL(6,2);
ALTER TABLE Trades ADD COLUMN Discount DECIMAL(6,2);
