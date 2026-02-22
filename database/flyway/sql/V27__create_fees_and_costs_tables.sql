-- Create separate tables for Fees and Costs to decouple from Cases table
DO $$ 
BEGIN
    -- Ensure UUID extension is available
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create FeeTypes lookup table for fee calculation types
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feetypes' AND table_schema = 'public') THEN
        CREATE TABLE FeeTypes (
            ID INT PRIMARY KEY,
            Name VARCHAR(50) NOT NULL UNIQUE,
            Description VARCHAR(255),
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert predefined fee types
        INSERT INTO FeeTypes (ID, Name, Description) VALUES
        (1, 'Percentage', 'Fee calculated as a percentage'),
        (2, 'Amount', 'Fee specified as a fixed amount');
    END IF;
    
    -- Create CaseFees table for all fees related to a case
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'casefees' AND table_schema = 'public') THEN
        CREATE TABLE CaseFees (
            ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            CaseID UUID NOT NULL REFERENCES Cases(ID) ON DELETE CASCADE,
            
            -- Setup Fee
            SetupFee DECIMAL(15,4),
            SetupFeeType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Admin Fee
            AdminFee DECIMAL(15,4),
            AdminFeeType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Management Fee
            ManagementFee DECIMAL(15,4),
            ManagementFeeType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Sales Fee
            SalesFee DECIMAL(15,4),
            SalesFeeType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Performance Fee
            PerformanceFee DECIMAL(15,4),
            PerformanceFeeType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Other Fees
            OtherFees DECIMAL(15,4),
            OtherFeesType INT REFERENCES FeeTypes(ID) ON DELETE RESTRICT,
            
            -- Audit fields
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Ensure one record per case
            CONSTRAINT unique_case_fees UNIQUE (CaseID)
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_casefees_case_id ON CaseFees(CaseID);
        CREATE INDEX idx_casefees_setup_fee_type ON CaseFees(SetupFeeType);
        CREATE INDEX idx_casefees_admin_fee_type ON CaseFees(AdminFeeType);
        CREATE INDEX idx_casefees_management_fee_type ON CaseFees(ManagementFeeType);
        CREATE INDEX idx_casefees_sales_fee_type ON CaseFees(SalesFeeType);
        CREATE INDEX idx_casefees_performance_fee_type ON CaseFees(PerformanceFeeType);
        CREATE INDEX idx_casefees_other_fees_type ON CaseFees(OtherFeesType);
        
        -- Create trigger for updating UpdatedAt timestamp
        CREATE OR REPLACE FUNCTION update_casefees_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.UpdatedAt = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_casefees_updated_at
            BEFORE UPDATE ON CaseFees
            FOR EACH ROW
            EXECUTE FUNCTION update_casefees_updated_at();
    END IF;
    
    -- Create CaseCosts table for all costs related to a case
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'casecosts' AND table_schema = 'public') THEN
        CREATE TABLE CaseCosts (
            ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            CaseID UUID NOT NULL REFERENCES Cases(ID) ON DELETE CASCADE,
            
            -- Paying Agent Costs
            PayingAgentCosts DECIMAL(15,4),
            
            -- Audit Costs
            AuditCosts DECIMAL(15,4),
            
            -- Legal Costs
            LegalCosts DECIMAL(15,4),
            
            -- Operational Costs
            OperationalCosts DECIMAL(15,4),
            
            -- Running Costs
            RunningCosts DECIMAL(15,4),
            
            -- Audit fields
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Ensure one record per case
            CONSTRAINT unique_case_costs UNIQUE (CaseID)
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_casecosts_case_id ON CaseCosts(CaseID);
        
        -- Create trigger for updating UpdatedAt timestamp
        CREATE OR REPLACE FUNCTION update_casecosts_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.UpdatedAt = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_casecosts_updated_at
            BEFORE UPDATE ON CaseCosts
            FOR EACH ROW
            EXECUTE FUNCTION update_casecosts_updated_at();
    END IF;
    
END $$;
