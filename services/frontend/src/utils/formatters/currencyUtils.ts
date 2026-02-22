type CurrencyFormatOptions = {
    locale?: string;
    currency?: string;
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
};

class CurrencyUtils {
    private static instance: CurrencyUtils;
    private defaultLocale: string;
    private defaultCurrency: string;
    private defaultMinFractionDigits: number;
    private defaultMaxFractionDigits: number;

    private constructor() {
        this.defaultLocale = process.env.REACT_APP_DEFAULT_LOCALE;
        this.defaultCurrency = process.env.REACT_APP_DEFAULT_CURRENCY;
        this.defaultMinFractionDigits = 2;
        this.defaultMaxFractionDigits = 2;
    }

    public static getInstance(): CurrencyUtils {
        if (!CurrencyUtils.instance) {
            CurrencyUtils.instance = new CurrencyUtils();
        }
        return CurrencyUtils.instance;
    }

    /**
     * Formats a number as currency with symbol
     */
    public format(
        value: number | null | undefined,
        options: CurrencyFormatOptions = {}
    ): string {
        return this.formatValue(value, { ...options, showSymbol: true });
    }

    /**
     * Formats a number as currency without symbol
     */
    public formatWithoutSymbol(
        value: number | null | undefined,
        options: Omit<CurrencyFormatOptions, 'showSymbol'> = {}
    ): string {
        return this.formatValue(value, { ...options, showSymbol: false });
    }

    /**
     * Internal method for formatting values
     */
    private formatValue(
        value: number | null | undefined,
        options: CurrencyFormatOptions = {}
    ): string {
        if (value === null || value === undefined || isNaN(value)) {
            return 'Invalid Value';
        }

        const {
            locale = this.defaultLocale,
            currency = this.defaultCurrency,
            showSymbol = true,
            minimumFractionDigits = this.defaultMinFractionDigits,
            maximumFractionDigits = this.defaultMaxFractionDigits
        } = options;

        try {
            if (showSymbol) {
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency,
                    minimumFractionDigits,
                    maximumFractionDigits
                }).format(value);
            } else {
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits,
                    maximumFractionDigits
                }).format(value);
            }
        } catch (error) {
            // Fallback formatting
            return value.toLocaleString(locale, {
                minimumFractionDigits,
                maximumFractionDigits
            });
        }
    }

    /**
     * Parses a currency string to number
     */
    public parse(value: string | null | undefined): number | null {
        if (!value) return null;
        
        // Remove currency symbols, commas, and spaces
        const cleanValue = value.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? null : parsed;
    }

    /**
     * Validates a currency value
     */
    public validate(
        value: string | number | null | undefined,
        options: {
            min?: number;
            max?: number;
            currency?: string;
        } = {}
    ): {
        isValid: boolean;
        error: string | null;
        value: number | null;
    } {
        const { min = 0, max, currency = this.defaultCurrency } = options;

        // Handle empty values
        if (value === null || value === undefined || value === '') {
            return {
                isValid: false,
                error: 'Amount is required',
                value: null
            };
        }

        // Parse the value if it's a string
        const numValue = typeof value === 'string' ? this.parse(value) : value;

        // Check if it's a valid number
        if (numValue === null || isNaN(numValue)) {
            return {
                isValid: false,
                error: 'Please enter a valid amount',
                value: null
            };
        }

        // Check minimum value
        if (numValue < min) {
            return {
                isValid: false,
                error: `Amount must be at least ${this.format(min, { currency })}`,
                value: numValue
            };
        }

        // Check maximum value
        if (max !== undefined && numValue > max) {
            return {
                isValid: false,
                error: `Amount cannot exceed ${this.format(max, { currency })}`,
                value: numValue
            };
        }

        return {
            isValid: true,
            error: null,
            value: numValue
        };
    }

    /**
     * Gets currency symbol
     */
    public getCurrencySymbol(
        currency: string = this.defaultCurrency,
        locale: string = this.defaultLocale
    ): string {
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
            }).formatToParts(0).find(part => part.type === 'currency')?.value || currency;
        } catch (error) {
            return currency;
        }
    }
}

// Export a singleton instance
export const currencyUtils = CurrencyUtils.getInstance();
