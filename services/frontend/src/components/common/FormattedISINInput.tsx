import React, { useState, useEffect } from 'react';
import { StyledFormControl } from '../styled/CommonStyled';
import { validateISIN, formatISIN, parseISIN, autoCompleteISIN } from '../../utils/isinValidation';

interface FormattedISINInputProps {
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    onBlur?: (value: string | null) => void;
    onValidationChange?: (isValid: boolean, error: string | null) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    autoComplete?: boolean; // Auto-calculate check digit when 11 characters are entered
    style?: React.CSSProperties;
    [key: string]: any; // Allow other props to pass through
}

const FormattedISINInput: React.FC<FormattedISINInputProps> = ({
    value,
    onChange,
    onBlur,
    onValidationChange,
    required = false,
    disabled = false,
    placeholder = "IN E 006K0101 8",
    autoComplete = true,
    style,
    ...rest
}) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Update display value when prop value changes
    useEffect(() => {
        if (!isFocused) {
            const formattedValue = formatISIN(value);
            setDisplayValue(formattedValue);
        }
    }, [value, isFocused]);

    // Initialize display value on mount
    useEffect(() => {
        const formattedValue = formatISIN(value);
        setDisplayValue(formattedValue);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.toUpperCase();
        
        // Remove any characters that aren't alphanumeric or spaces
        const cleanInput = inputValue.replace(/[^A-Z0-9\s]/g, '');
        
        setDisplayValue(cleanInput);
        
        const parsedValue = parseISIN(cleanInput);
        let finalValue = parsedValue;
        
        // Auto-complete check digit if enabled and we have 11 characters
        if (autoComplete && parsedValue && parsedValue.length === 11) {
            finalValue = autoCompleteISIN(parsedValue);
            // Update display with the completed ISIN
            setTimeout(() => {
                const formattedComplete = formatISIN(finalValue);
                setDisplayValue(formattedComplete);
            }, 100);
        }
        
        // Validate the value
        const validation = validateISIN(finalValue);
        
        // Call validation callback if provided
        if (onValidationChange) {
            onValidationChange(validation.isValid, validation.error);
        }
        
        // Always call onChange with the parsed value (even if invalid)
        onChange(finalValue);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        
        const parsedValue = parseISIN(e.target.value);
        let finalValue = parsedValue;
        
        // Auto-complete check digit if enabled and we have 11 characters
        if (autoComplete && parsedValue && parsedValue.length === 11) {
            finalValue = autoCompleteISIN(parsedValue);
        }
        
        // Format the display value when losing focus
        const formattedValue = formatISIN(finalValue);
        setDisplayValue(formattedValue);
        
        // Validate the final value
        const validation = validateISIN(finalValue);
        
        // Call validation callback if provided
        if (onValidationChange) {
            onValidationChange(validation.isValid, validation.error);
        }
        
        // Call onBlur callback if provided
        if (onBlur) {
            onBlur(finalValue);
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
            (e.keyCode >= 35 && e.keyCode <= 39) ||
            // Allow: space
            e.keyCode === 32) {
            return;
        }
        
        // Ensure that it is alphanumeric only
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
            (e.keyCode < 65 || e.keyCode > 90) &&
            (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
        
        // Limit length to 14 characters (formatted length with spaces)
        if ((e.target as HTMLInputElement).value.length >= 14 && 
            ![8, 9, 27, 13, 46, 35, 36, 37, 38, 39].includes(e.keyCode)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').toUpperCase();
        const cleanPasted = pastedText.replace(/[^A-Z0-9]/g, '');
        
        if (cleanPasted.length <= 12) {
            let finalValue = cleanPasted;
            
            // Auto-complete check digit if enabled and we have 11 characters
            if (autoComplete && cleanPasted.length === 11) {
                finalValue = autoCompleteISIN(cleanPasted);
            }
            
            const formattedValue = formatISIN(finalValue);
            setDisplayValue(formattedValue);
            
            // Validate and notify
            const validation = validateISIN(finalValue);
            if (onValidationChange) {
                onValidationChange(validation.isValid, validation.error);
            }
            
            onChange(finalValue);
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
            onPaste={handlePaste}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            style={style}
            maxLength={14} // XX X XXXXXXXX X
            {...rest}
        />
    );
};

export default FormattedISINInput;
