type DateFormatOptions = {
    locale?: string;
    format?: 'short' | 'medium' | 'long' | 'full';
    timeZone?: string;
};

type DateValidationOptions = {
    min?: Date;
    max?: Date;
    required?: boolean;
    disableWeekends?: boolean;
};

class DateUtils {
    private static instance: DateUtils;
    private defaultLocale: string;
    private defaultFormat: 'short' | 'medium' | 'long' | 'full';
    private defaultTimeZone: string;

    private constructor() {
        this.defaultLocale = process.env.REACT_APP_DEFAULT_LOCALE || 'en-US';
        this.defaultFormat = 'short';
        this.defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    public static getInstance(): DateUtils {
        if (!DateUtils.instance) {
            DateUtils.instance = new DateUtils();
        }
        return DateUtils.instance;
    }

    /**
     * Format a date to string using consistent formatting
     */
    public format(
        value: Date | string | null | undefined,
        options: DateFormatOptions = {}
    ): string {
        if (!value) return '';

        const {
            locale = this.defaultLocale,
            format = this.defaultFormat,
            timeZone = this.defaultTimeZone
        } = options;

        try {
            const date = typeof value === 'string' ? new Date(value) : value;
            
            if (isNaN(date.getTime())) {
                return '';
            }

            const formatOptions: Intl.DateTimeFormatOptions = {
                timeZone,
                ...this.getFormatOptions(format)
            };

            return new Intl.DateTimeFormat(locale, formatOptions).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    /**
     * Parse a date string to Date object
     */
    public parse(value: string | null | undefined): Date | null {
        if (!value) return null;

        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    /**
     * Validate a date value
     */
    public validate(
        value: Date | string | null | undefined,
        options: DateValidationOptions = {}
    ): {
        isValid: boolean;
        error: string | null;
        value: Date | null;
    } {
        const { min, max, required = false, disableWeekends = false } = options;

        // Handle empty values
        if (!value) {
            return {
                isValid: !required,
                error: required ? 'Date is required' : null,
                value: null
            };
        }

        // Parse the date if it's a string
        const date = typeof value === 'string' ? new Date(value) : value;

        // Check if it's a valid date
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                error: 'Please enter a valid date',
                value: null
            };
        }

        // Check minimum date
        if (min && date < min) {
            return {
                isValid: false,
                error: `Date must be after ${this.format(min)}`,
                value: date
            };
        }

        // Check maximum date
        if (max && date > max) {
            return {
                isValid: false,
                error: `Date must be before ${this.format(max)}`,
                value: date
            };
        }

        // Check weekends if disabled
        if (disableWeekends && this.isWeekend(date)) {
            return {
                isValid: false,
                error: 'Weekend dates are not allowed',
                value: date
            };
        }

        return {
            isValid: true,
            error: null,
            value: date
        };
    }

    /**
     * Check if a date is a weekend
     */
    public isWeekend(date: Date): boolean {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
    }

    /**
     * Convert format string to DateTimeFormat options
     */
    private getFormatOptions(format: 'short' | 'medium' | 'long' | 'full'): Intl.DateTimeFormatOptions {
        switch (format) {
            case 'short':
                return {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                };
            case 'medium':
                return {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                };
            case 'long':
                return {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                };
            case 'full':
                return {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                };
        }
    }

    /**
     * Get today's date at start of day
     */
    public today(): Date {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Add days to a date
     */
    public addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Get the difference in days between two dates
     */
    public getDaysDifference(date1: Date, date2: Date): number {
        const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    }

    /**
     * Check if two dates are the same day
     */
    public isSameDay(date1: Date | string, date2: Date | string): boolean {
        const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
        const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    }
}

// Export a singleton instance
export const dateUtils = DateUtils.getInstance();
