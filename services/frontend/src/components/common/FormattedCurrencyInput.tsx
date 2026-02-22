import React, { useState, useEffect } from 'react';
import { StyledFormControl } from '../styled/CommonStyled';
import { currencyUtils } from '../../utils/formatters';

interface FormattedCurrencyInputProps {
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    onBlur?: (value: number | null) => void;
    onValidationChange?: (isValid: boolean, error: string | null) => void;
    currency?: string;
    locale?: string;
    min?: number;
    max?: number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    showSymbol?: boolean;
    style?: React.CSSProperties;
    [key: string]: any; // Allow other props to pass through
}

const FormattedCurrencyInput: React.FC<FormattedCurrencyInputProps> = ({
    value,
    onChange,
    onBlur,
    onValidationChange,
    currency = 'USD',
    locale = 'en-US',
    min = 0,
    max,
    required = false,
    disabled = false,
    placeholder,
    showSymbol = true,
    style,
    ...rest
}) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Update display value when prop value changes
    useEffect(() => {
        if (!isFocused) {
            const formattedValue = currencyUtils.format(value, { currency, locale, showSymbol });
            setDisplayValue(formattedValue);
        }
    }, [value, currency, locale, showSymbol, isFocused]);

    // Initialize display value on mount
    useEffect(() => {
        const formattedValue = currencyUtils.format(value, { currency, locale, showSymbol });
        setDisplayValue(formattedValue);
    }, []);

    // Generate default placeholder if not provided
    const defaultPlaceholder = placeholder || currencyUtils.format(0, { currency, locale, showSymbol });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);
        
        const parsedValue = currencyUtils.parse(inputValue);
        
        // Validate the value
        const validation = currencyUtils.validate(parsedValue, { min, max, currency });
        
        // Call validation callback if provided
        if (onValidationChange) {
            onValidationChange(validation.isValid, validation.error);
        }
        
        // Always call onChange with the parsed value (even if invalid)
        onChange(parsedValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        
        // When focusing, show just the number for easier editing
        if (value !== null && value !== undefined && !isNaN(value)) {
            setDisplayValue(value.toString());
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        
        const parsedValue = currencyUtils.parse(e.target.value);
        
        // Format the display value when losing focus
        const formattedValue = currencyUtils.format(parsedValue, { currency, locale, showSymbol });
        setDisplayValue(formattedValue);
        
        // Validate the final value
        const validation = currencyUtils.validate(parsedValue, { min, max, currency });
        
        // Call validation callback if provided
        if (onValidationChange) {
            onValidationChange(validation.isValid, validation.error);
        }
        
        // Call onBlur callback if provided
        if (onBlur) {
            onBlur(parsedValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        
        // Allow comma for thousands separator
        if (e.keyCode === 188) {
            return;
        }
        
        // Ensure that it is a number or decimal point
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
            (e.keyCode < 96 || e.keyCode > 105) && 
            e.keyCode !== 190 && e.keyCode !== 110) {
            e.preventDefault();
        }
        
        // Only allow one decimal point
        if ((e.keyCode === 190 || e.keyCode === 110) && 
            (e.target as HTMLInputElement).value.indexOf('.') !== -1) {
            e.preventDefault();
        }
    };

    return (
        <StyledFormControl
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required={required}
            disabled={disabled}
            placeholder={defaultPlaceholder}
            style={style}
            inputMode="decimal"
            pattern={`^${process.env.REACT_APP_CURRENCY_FORMAT}$`} // Use the currency format from env
            {...rest}
        />
    );
};

export default FormattedCurrencyInput;
