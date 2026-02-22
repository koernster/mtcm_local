-- Create Trades table
CREATE TABLE IF NOT EXISTS Trades (
    ID UUID PRIMARY KEY,
    ISINID UUID NOT NULL,
    TradeType INT NOT NULL,
    TradeDate TIMESTAMP NOT NULL,
    ValueDate TIMESTAMP NOT NULL,
    CounterParty VARCHAR(55),
    Bank_Investor VARCHAR(55),
    Reference VARCHAR(55),
    Sales VARCHAR(55),
    Notional DECIMAL(18,0),
    Price_Dirty DECIMAL(18,0),
    TranFee DECIMAL(18,0),
    TranStatus INT NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_trades_isinid FOREIGN KEY (ISINID) REFERENCES CaseISINs(ID),
    CONSTRAINT fk_trades_tradetype FOREIGN KEY (TradeType) REFERENCES TradeTypes(ID),
    CONSTRAINT fk_trades_transtatus FOREIGN KEY (TranStatus) REFERENCES TranTypes(ID)
);

-- Trigger function to prevent hard and soft deletes after 24 hours
CREATE OR REPLACE FUNCTION prevent_trades_delete_after_24h()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.CreatedAt < NOW() - INTERVAL '24 hours') THEN
        RAISE EXCEPTION 'Cannot delete Record after 24 hours of creation.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hard delete
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_prevent_trades_hard_delete'
        AND tgrelid = 'trades'::regclass
    ) THEN
        CREATE TRIGGER trg_prevent_trades_hard_delete
        BEFORE DELETE ON Trades
        FOR EACH ROW EXECUTE FUNCTION prevent_trades_delete_after_24h();
    END IF;
END $$;

-- Trigger for soft delete (TranStatus = 3)
CREATE OR REPLACE FUNCTION prevent_trades_soft_delete_after_24h()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.TranStatus = 3 AND OLD.CreatedAt < NOW() - INTERVAL '24 hours') THEN
        RAISE EXCEPTION 'Cannot delete Record after 24 hours of creation.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_prevent_trades_soft_delete'
        AND tgrelid = 'trades'::regclass
    ) THEN
        CREATE TRIGGER trg_prevent_trades_soft_delete
        BEFORE UPDATE OF TranStatus ON Trades
        FOR EACH ROW EXECUTE FUNCTION prevent_trades_soft_delete_after_24h();
    END IF;
END $$;
