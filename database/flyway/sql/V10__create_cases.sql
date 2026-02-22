-- Create Cases table with proper structure and relationships
DO $$ 
BEGIN
    -- Ensure UUID extension is available
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create Cases table with proper structure and relationships
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases' AND table_schema = 'public') THEN
        CREATE TABLE Cases (
            ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            CompanyID UUID REFERENCES Companies(ID) ON DELETE CASCADE,
            CompartmentName VARCHAR(255),
            AgentTypeID UUID REFERENCES PayAgentTypes(ID) ON DELETE SET NULL,
            InvestTypeID UUID REFERENCES InvestmentTypes(ID) ON DELETE SET NULL,
            ProdTypeID UUID REFERENCES ProductTypes(ID) ON DELETE SET NULL,
            SubscriptionDate DATE,
            IssueDate DATE,
            MaturityDate DATE,
            CoponFreqID UUID REFERENCES CoponFrequencies(ID) ON DELETE SET NULL,
            CoponTypeID UUID REFERENCES CoponTypes(ID) ON DELETE SET NULL,
            IssuePrice DECIMAL(10,2),
            MinTradeAmt DECIMAL(10,2),
            MinTradeLot INT,
            EarlyRedemptionDate DATE,
            Custodian UUID REFERENCES Custodians(ID) ON DELETE SET NULL,
            CompartmentStatusID INT REFERENCES Status(ID) ON DELETE RESTRICT,
            -- Cost fields
            PayingAgentCosts DECIMAL(10,2),
            AuditCosts DECIMAL(10,2),
            LegalCosts DECIMAL(10,2),
            OperationalCosts DECIMAL(10,2),
            RunningCosts DECIMAL(10,2),
            SetupFee DECIMAL(10,2),
            AdminFee DECIMAL(10,2),
            ManagementFee DECIMAL(10,2),
            SalesFee DECIMAL(10,2),
            PerformanceFee DECIMAL(10,2),
            OtherFees DECIMAL(10,2),
            -- CoponPaymentScheduleID will be added later in V19
            -- Audit fields
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_cases_company_id ON Cases(CompanyID);
        CREATE INDEX idx_cases_compartment_status_id ON Cases(CompartmentStatusID);
        CREATE INDEX idx_cases_agent_type_id ON Cases(AgentTypeID);
        CREATE INDEX idx_cases_invest_type_id ON Cases(InvestTypeID);
        CREATE INDEX idx_cases_prod_type_id ON Cases(ProdTypeID);
        CREATE INDEX idx_cases_copon_freq_id ON Cases(CoponFreqID);
        CREATE INDEX idx_cases_copon_type_id ON Cases(CoponTypeID);
        CREATE INDEX idx_cases_custodian ON Cases(Custodian);
        
        -- Create trigger for updating UpdatedAt timestamp
        CREATE OR REPLACE FUNCTION update_cases_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.UpdatedAt = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_cases_updated_at
            BEFORE UPDATE ON Cases
            FOR EACH ROW
            EXECUTE FUNCTION update_cases_updated_at();
    END IF;
END $$;