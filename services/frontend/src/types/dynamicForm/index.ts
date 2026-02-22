/**
 * Dynamic Form Configuration Types
 * 
 * These types define the JSON structure stored in productprofiles.profileconfig
 * Used by the dynamic form renderer to generate forms based on product type.
 */

// ===== Field Configuration =====

/**
 * Options configuration for select/autocomplete fields
 */
export interface OptionsConfig {
    /** Key in OptionsRegistry (e.g., "spvs", "investmentTypes") */
    source: string;
    /** Field name for option value (e.g., "id") */
    valueKey: string;
    /** Field name for display label (e.g., "typename", "spvtitle") */
    labelKey: string;
    /** Array of values to exclude from the dropdown (by valueKey) */
    excludeValues?: string[];
}

/**
 * Create new item configuration for autocomplete
 */
export interface AutocompleteCreateConfig {
    /** Whether create new is enabled */
    enabled: boolean;
    /** Handler name in formContext.handlers */
    handler?: string;
    /** Label shown for create hint */
    label?: string;
}

/**
 * Autocomplete field configuration
 */
export interface AutocompleteConfig {
    /** Service name in ServiceRegistry (e.g., "CompanyService", "CustodianService") */
    searchService: string;
    /** Method name on the service to call for search */
    searchMethod: string;
    /** Property key for display label */
    labelKey: string;
    /** Property key for value */
    valueKey: string;
    /** Minimum characters before searching (default: 2) */
    minLength?: number;
    /** Debounce delay in ms (default: 300) */
    debounceMs?: number;
    /** Input placeholder */
    placeholder?: string;
    /** Create new item configuration */
    createNew?: AutocompleteCreateConfig;
}

/**
 * Single field configuration
 */
export interface FieldConfig {
    /** Database field key (e.g., "issuedate", "maturitydate") */
    key: string;
    /** Position in the grid for ordering */
    position: number;
    /** Internal reference name */
    name: string;
    /** Display label shown to user */
    alias: string;
    /** Help text shown below the field */
    fieldInfo: string;
    /** React component name from FieldRegistry */
    reactComponent: string;
    /** Bootstrap column size (default: calculated from grid) */
    colSize?: number;
    /** Whether field is required */
    required?: boolean;
    /** Whether field is disabled */
    disabled?: boolean;
    /** Options config for select/autocomplete fields */
    options?: OptionsConfig;
    /** Autocomplete config for AutocompleteInput fields */
    autocomplete?: AutocompleteConfig;
    /** Additional props passed to the field component */
    props?: Record<string, unknown>;
}

// ===== Condition Configuration =====

/**
 * Condition for showing/hiding sections
 */
export interface ConditionConfig {
    /** Field path using dot notation (e.g., "investmenttype.typename") */
    field: string;
    /** Value to compare for equality */
    equals?: unknown;
    /** Value to compare for inequality */
    notEquals?: unknown;
}

// ===== Section Configuration =====

/**
 * Section configuration - either a grid of fields or a custom component
 */
export interface SectionConfig {
    /** Unique section identifier */
    id: string;
    /** Optional section title (renders as card header) */
    title?: string;
    /** Section type: 'fields' for auto-rendered grid, 'custom' for custom component */
    type: 'fields' | 'custom';
    /** Custom component name from CustomSectionRegistry (for type='custom') */
    customComponent?: string;
    /** Field configurations (for type='fields') */
    fields?: FieldConfig[];
    /** Number of columns in grid (2 = sm={6}, 3 = sm={4}) */
    grid?: number;
    /** Condition for showing this section */
    showWhen?: ConditionConfig;
}

// ===== Tab Configuration =====

/**
 * Tab configuration containing multiple sections
 */
export interface TabConfig {
    /** Unique tab identifier (e.g., "basic-product-info") */
    id: string;
    /** Tab display name */
    name: string;
    /** Sections within this tab */
    sections: SectionConfig[];
}

// ===== Root Profile Configuration =====

/**
 * Root configuration stored in productprofiles.profileconfig JSONB column
 */
export interface ProductProfileConfig {
    /** Display name for this product profile */
    productName?: string;
    /** Tab configurations */
    tabs: TabConfig[];
    /** Future rules engine configuration (placeholder) */
    rules?: Record<string, unknown>;
}

// ===== Database Entity =====

/**
 * ProductProfile entity matching database schema
 */
export interface ProductProfile {
    /** UUID primary key */
    id: string;
    /** Foreign key to ProductTypes table */
    producttypeid: string;
    /** JSONB configuration */
    profileconfig: ProductProfileConfig;
}

// ===== Form Context Types =====

/**
 * Form context interface for field components
 */
export interface FormContextType {
    /** Get field value by key */
    getValue: (key: string, nestedPath?: string) => unknown;
    /** Handle field value change (updates Redux store) */
    handleChange: (key: string, value: unknown, nestedPath?: string) => void;
    /** Handle field blur (triggers save to database) */
    handleBlur: (key: string, value: unknown) => Promise<void>;
    /** Get field error message */
    getError: (key: string) => string | undefined;
    /** Check if field is loading */
    isLoading: (key: string) => boolean;
    /** Whether form is disabled (case freezed) */
    disabled: boolean;
    /** Raw case data for custom components */
    caseData: unknown;
    /** All loading states */
    loadingStates: Record<string, boolean>;
    /** All error states */
    errorStates: Record<string, string>;
    /** Redux dispatch function */
    dispatch: unknown;
    /** Set loading state for a field */
    setFieldLoading: (field: string, loading: boolean) => void;
    /** Set error state for a field */
    setFieldError: (field: string, error: string | null) => void;
}

// ===== Field Props =====

/**
 * Props passed to field components in FieldRegistry
 */
export interface FieldProps {
    /** Field configuration */
    config: FieldConfig;
    /** Current field value */
    value: unknown;
    /** Change handler */
    onChange: (value: unknown) => void;
    /** Blur handler (triggers save) */
    onBlur: (value: unknown) => void;
    /** Error message if any */
    error?: string;
    /** Whether field is disabled */
    disabled?: boolean;
    /** Options for select/autocomplete fields */
    options?: unknown[];
    /** Form context for fields that need access to other form values (e.g., SwitchableInput) */
    formContext?: FormContextType;
}

// ===== Custom Section Props =====

/**
 * Props passed to custom section components
 */
export interface CustomSectionProps {
    /** Form context with all form operations */
    formContext: FormContextType;
}
