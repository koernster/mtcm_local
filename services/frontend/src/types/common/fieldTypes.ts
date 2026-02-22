/**
 * Common field type enum used across the application
 * Represents whether a field should be treated as a percentage or amount
 */
export const FIELD_TYPES = {
    PERCENTAGE: 1,
    AMOUNT: 2
} as const;

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

/**
 * Helper function to get field type from various input formats
 */
export const getFieldType = (value: any): FieldType => {
    // Handle explicit values for both percentage and amount
    if (value === FIELD_TYPES.AMOUNT || value === 2 || value === '2') {
        return FIELD_TYPES.AMOUNT;
    }
    if (value === FIELD_TYPES.PERCENTAGE || value === 1 || value === '1') {
        return FIELD_TYPES.PERCENTAGE;
    }
    
    // Default to percentage
    return FIELD_TYPES.PERCENTAGE;
};

/**
 * Helper function to check if a field type is percentage
 */
export const isPercentageType = (fieldType: FieldType): boolean => {
    return fieldType === FIELD_TYPES.PERCENTAGE;
};

/**
 * Helper function to check if a field type is amount
 */
export const isAmountType = (fieldType: FieldType): boolean => {
    return fieldType === FIELD_TYPES.AMOUNT;
};
