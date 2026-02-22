-- V66: Add logo column to SPVs table
-- Allows storing SPV logo image as binary data

ALTER TABLE spvs 
ADD COLUMN IF NOT EXISTS logo BYTEA;

COMMENT ON COLUMN spvs.logo IS 'SPV logo image stored as binary data';
