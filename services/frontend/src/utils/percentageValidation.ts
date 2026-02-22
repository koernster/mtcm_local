interface PercentageValidationResult {
    isValid: boolean;
    error: string | null;
    value: number | null;
}

/**
 * Validates a percentage value
 * @param value - The value to validate (can be string or number)
 * @param min - Minimum allowed percentage (default: 0)
 * @param max - Maximum allowed percentage (default: 100)
 * @param required - Whether the field is required (default: false)
 * @returns Validation result with error message if invalid
 */
export const validatePercentage = (
    value: string | number | null | undefined,
    min: number = 0,
    max: number = 100,
    required: boolean = false
): PercentageValidationResult => {
    // Handle empty or null values
    if (value === null || value === undefined || value === '') {
        if (required) {
            return {
                isValid: false,
                error: 'Percentage is required',
                value: null
            };
        } else {
            // Optional field - empty values are valid
            return {
                isValid: true,
                error: null,
                value: null
            };
        }
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
        return {
            isValid: false,
            error: 'Please enter a valid percentage',
            value: null
        };
    }

    // Check if it's within the allowed range
    if (numValue < min) {
        return {
            isValid: false,
            error: `Percentage must be at least ${min}%`,
            value: numValue
        };
    }

    if (numValue > max) {
        return {
            isValid: false,
            error: `Percentage cannot exceed ${max}%`,
            value: numValue
        };
    }

    return {
        isValid: true,
        error: null,
        value: numValue
    };
};

/**
 * Formats a percentage value for display
 * @param value - The percentage value to format
 * @param decimalPlaces - Number of decimal places to show (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, decimalPlaces: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) {
        return '';
    }
    return value.toFixed(decimalPlaces);
};

/**
 * Parses a percentage input value
 * @param value - The input value to parse
 * @returns Parsed number or null if invalid
 */
export const parsePercentage = (value: string): number | null => {
    if (!value || value.trim() === '') {
        return null;
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
};
