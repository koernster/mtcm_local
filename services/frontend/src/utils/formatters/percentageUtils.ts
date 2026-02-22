type PercentageFormatOptions = {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
};

class PercentageUtils {
    private static instance: PercentageUtils;
    private defaultLocale: string;
    private defaultMinFractionDigits: number;
    private defaultMaxFractionDigits: number;

    private constructor() {
        this.defaultLocale = process.env.REACT_APP_DEFAULT_LOCALE;
        this.defaultMinFractionDigits = 2;
        this.defaultMaxFractionDigits = 2;
    }

    public static getInstance(): PercentageUtils {
        if (!PercentageUtils.instance) {
            PercentageUtils.instance = new PercentageUtils();
        }
        return PercentageUtils.instance;
    }

    /**
     * Formats a number as percentage with symbol
     */
    public format(
        value: number | null | undefined,
        options: PercentageFormatOptions = {}
    ): string {
        return this.formatValue(value, { ...options, showSymbol: true });
    }

    /**
     * Formats a number as percentage without symbol
     */
    public formatWithoutSymbol(
        value: number | null | undefined,
        options: Omit<PercentageFormatOptions, 'showSymbol'> = {}
    ): string {
        return this.formatValue(value, { ...options, showSymbol: false });
    }

    /**
     * Internal method for formatting values
     */
    private formatValue(
        value: number | null | undefined,
        options: PercentageFormatOptions = {}
    ): string {
        if (value === null || value === undefined || isNaN(value)) {
            return '';
        }

        const {
            locale = this.defaultLocale,
            minimumFractionDigits = this.defaultMinFractionDigits,
            maximumFractionDigits = this.defaultMaxFractionDigits,
            showSymbol = true
        } = options;

        try {
            if (showSymbol) {
                return new Intl.NumberFormat(locale, {
                    style: 'percent',
                    minimumFractionDigits,
                    maximumFractionDigits
                }).format(value / 100);
            } else {
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits,
                    maximumFractionDigits
                }).format(value);
            }
        } catch (error) {
            // Fallback formatting
            const formatted = value.toFixed(maximumFractionDigits);
            return showSymbol ? `${formatted}%` : formatted;
        }
    }

    /**
     * Parses a percentage string to number
     */
    public parse(value: string | null | undefined): number | null {
        if (!value) return null;
        
        // Remove percentage symbol and whitespace
        const cleanValue = value.replace(/[%\s]/g, '');
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? null : parsed;
    }

    /**
     * Validates a percentage value
     */
    public validate(
        value: string | number | null | undefined,
        options: {
            min?: number;
            max?: number;
        } = {}
    ): {
        isValid: boolean;
        error: string | null;
        value: number | null;
    } {
        const { min = 0, max = 100 } = options;

        // Handle empty values
        if (value === null || value === undefined || value === '') {
            return {
                isValid: false,
                error: 'Percentage is required',
                value: null
            };
        }

        // Parse the value if it's a string
        const numValue = typeof value === 'string' ? this.parse(value) : value;

        // Check if it's a valid number
        if (numValue === null || isNaN(numValue)) {
            return {
                isValid: false,
                error: 'Please enter a valid percentage',
                value: null
            };
        }

        // Check minimum value
        if (numValue < min) {
            return {
                isValid: false,
                error: `Percentage must be at least ${this.format(min)}`,
                value: numValue
            };
        }

        // Check maximum value
        if (max !== undefined && numValue > max) {
            return {
                isValid: false,
                error: `Percentage cannot exceed ${this.format(max)}`,
                value: numValue
            };
        }

        return {
            isValid: true,
            error: null,
            value: numValue
        };
    }
}

// Export a singleton instance
export const percentageUtils = PercentageUtils.getInstance();
