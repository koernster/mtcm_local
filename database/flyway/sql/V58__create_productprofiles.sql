-- Create ProductProfiles table
CREATE TABLE IF NOT EXISTS productprofiles (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producttypeid UUID NOT NULL UNIQUE,
    profileconfig JSONB NOT NULL,
    CONSTRAINT fk_productprofiles_producttype FOREIGN KEY (producttypeid)
        REFERENCES ProductTypes(ID) ON DELETE CASCADE
);
