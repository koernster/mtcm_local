interface ISINValidationResult {
    isValid: boolean;
    error: string | null;
    value: string | null;
}

/**
 * Country codes mapping for ISIN validation
 */
const VALID_COUNTRY_CODES = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
];

/**
 * Security type codes for ISIN validation
 */
const VALID_SECURITY_TYPES = ['E', 'D', 'C', 'R', 'F', 'W', 'M', 'T', 'A'];

/**
 * Calculate the check digit for an ISIN using the Luhn algorithm
 * @param isinWithoutCheckDigit - ISIN without the check digit (11 characters)
 * @returns Check digit (0-9)
 */
export const calculateISINCheckDigit = (isinWithoutCheckDigit: string): string => {
    // Convert letters to numbers (A=10, B=11, ..., Z=35)
    let numericString = '';
    for (const char of isinWithoutCheckDigit) {
        if (char >= 'A' && char <= 'Z') {
            numericString += (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10).toString();
        } else {
            numericString += char;
        }
    }

    // Apply Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    // Process from right to left
    for (let i = numericString.length - 1; i >= 0; i--) {
        let digit = parseInt(numericString[i]);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit = Math.floor(digit / 10) + (digit % 10);
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return ((10 - (sum % 10)) % 10).toString();
};

/**
 * Validates an ISIN number
 * @param value - The ISIN value to validate
 * @returns Validation result with error message if invalid
 */
export const validateISIN = (value: string | null | undefined): ISINValidationResult => {
    // Handle empty or null values
    if (!value || value.trim() === '') {
        return {
            isValid: false,
            error: 'ISIN is required',
            value: null
        };
    }

    const cleanValue = value.replace(/\s/g, '').toUpperCase();

    // Check length
    if (cleanValue.length !== 12) {
        return {
            isValid: false,
            error: 'ISIN must be exactly 12 characters',
            value: cleanValue
        };
    }

    // Extract parts
    const countryCode = cleanValue.substring(0, 2);
    const securityType = cleanValue.substring(2, 3);
    const securityNumber = cleanValue.substring(3, 11);
    const checkDigit = cleanValue.substring(11, 12);

    // Validate country code
    if (!VALID_COUNTRY_CODES.includes(countryCode)) {
        return {
            isValid: false,
            error: `Invalid country code: ${countryCode}`,
            value: cleanValue
        };
    }

    // Validate security type
    if (!VALID_SECURITY_TYPES.includes(securityType)) {
        return {
            isValid: false,
            error: `Invalid security type: ${securityType}. Must be one of: ${VALID_SECURITY_TYPES.join(', ')}`,
            value: cleanValue
        };
    }

    // Validate security number (must be alphanumeric)
    if (!/^[A-Z0-9]{8}$/.test(securityNumber)) {
        return {
            isValid: false,
            error: 'Security number must be 8 alphanumeric characters',
            value: cleanValue
        };
    }

    // Validate check digit
    if (!/^[0-9]$/.test(checkDigit)) {
        return {
            isValid: false,
            error: 'Check digit must be a single number (0-9)',
            value: cleanValue
        };
    }

    // Calculate and verify check digit
    const calculatedCheckDigit = calculateISINCheckDigit(cleanValue.substring(0, 11));
    if (checkDigit !== calculatedCheckDigit) {
        return {
            isValid: false,
            error: `Invalid check digit. Expected: ${calculatedCheckDigit}, got: ${checkDigit}`,
            value: cleanValue
        };
    }

    return {
        isValid: true,
        error: null,
        value: cleanValue
    };
};

/**
 * Formats an ISIN number with spaces
 * @param value - The ISIN value to format
 * @returns Formatted ISIN string with spaces
 */
export const formatISIN = (value: string | null | undefined): string => {
    if (!value) return '';
    
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    
    if (cleanValue.length === 0) return '';
    
    // Format: XX X XXXXXXXX X
    let formatted = '';
    
    // Country code (2 chars)
    if (cleanValue.length >= 1) {
        formatted += cleanValue.substring(0, Math.min(2, cleanValue.length));
    }
    
    // Space after country code
    if (cleanValue.length >= 3) {
        formatted += ' ' + cleanValue.substring(2, Math.min(3, cleanValue.length));
    }
    
    // Space after security type
    if (cleanValue.length >= 4) {
        formatted += ' ' + cleanValue.substring(3, Math.min(11, cleanValue.length));
    }
    
    // Space before check digit
    if (cleanValue.length >= 12) {
        formatted += ' ' + cleanValue.substring(11, 12);
    }
    
    return formatted;
};

/**
 * Parses an ISIN input value by removing spaces
 * @param value - The input value to parse
 * @returns Clean ISIN string without spaces
 */
export const parseISIN = (value: string): string | null => {
    if (!value || value.trim() === '') {
        return null;
    }
    
    return value.replace(/\s/g, '').toUpperCase();
};

/**
 * Auto-complete ISIN with calculated check digit
 * @param partialISIN - ISIN without check digit (11 characters)
 * @returns Complete ISIN with calculated check digit
 */
export const autoCompleteISIN = (partialISIN: string): string => {
    const cleanValue = partialISIN.replace(/\s/g, '').toUpperCase();
    
    if (cleanValue.length === 11) {
        const checkDigit = calculateISINCheckDigit(cleanValue);
        return cleanValue + checkDigit;
    }
    
    return cleanValue;
};
