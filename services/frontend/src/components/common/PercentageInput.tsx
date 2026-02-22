import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyledFormControl } from '../styled/CommonStyled';
import { percentageUtils } from '../../utils/formatters';

interface PercentageInputProps {
    value: number | null | undefined;
    onChange: (value: number | null) => void;
    onBlur?: (value: number | null) => void;
    onValidationChange?: (isValid: boolean, error: string | null) => void;
    min?: number;
    max?: number;
    decimalPlaces?: number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    style?: React.CSSProperties;
    [key: string]: any; // Allow other props to pass through
}

const PercentageInput: React.FC<PercentageInputProps> = ({
    value,
    onChange,
    onBlur,
    onValidationChange,
    min = 0,
    max = 100,
    decimalPlaces = 2,
    required = false,
    disabled = false,
    placeholder = "0.00%",
    style,
    ...rest
}) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Memoize the formatted value to prevent unnecessary recalculations
    const formattedValue = useMemo(() => {
        return percentageUtils.format(value, { maximumFractionDigits: decimalPlaces });
    }, [value, decimalPlaces]);

    // Memoize validation to prevent unnecessary recalculations
    const validation = useMemo(() => {
        if (value !== null && value !== undefined) {
            return percentageUtils.validate(value, { min, max });
        }
        return { isValid: true, error: null };
    }, [value, min, max]);

    // Update display value when prop value changes (only when not focused)
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(formattedValue);
        }
    }, [formattedValue, isFocused]);

    // Trigger validation when value changes
    useEffect(() => {
        if (value !== null && value !== undefined && onValidationChange) {
            onValidationChange(validation.isValid, validation.error);
        }
    }, [value, validation.isValid, validation.error, onValidationChange]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Remove % symbol if present for parsing
        const cleanValue = inputValue.replace('%', '');
        const parsedValue = percentageUtils.parse(cleanValue);
        
        // Cap values at the maximum allowed (usually 100) and minimum (usually 0)
        let adjustedValue = parsedValue;
        if (parsedValue !== null) {
            if (parsedValue > max) {
                adjustedValue = max;
                // Update display to show the capped value
                setDisplayValue(percentageUtils.format(max));
            } else if (parsedValue < min) {
                adjustedValue = min;
                // Update display to show the capped value
                setDisplayValue(percentageUtils.format(min));
            } else {
                setDisplayValue(inputValue);
            }
        } else {
            setDisplayValue(inputValue);
        }
        
        // Validate the adjusted value and call validation callback if provided
        if (onValidationChange) {
            const adjustedValidation = percentageUtils.validate(adjustedValue, { min, max });
            onValidationChange(adjustedValidation.isValid, adjustedValidation.error);
        }
        
        // Always call onChange with the adjusted value
        onChange(adjustedValue);
    }, [min, max, onChange, onValidationChange]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        
        // Remove % symbol if present for parsing
        const cleanValue = e.target.value.replace('%', '');
        const parsedValue = percentageUtils.parse(cleanValue);
        
        // Format the display value when losing focus with % symbol
        const formatted = percentageUtils.format(parsedValue, { maximumFractionDigits: decimalPlaces });
        setDisplayValue(formatted);
        
        // Validate the final value and call validation callback if provided
        if (onValidationChange) {
            const blurValidation = percentageUtils.validate(parsedValue, { min, max });
            onValidationChange(blurValidation.isValid, blurValidation.error);
        }
        
        // Call onBlur callback if provided
        if (onBlur) {
            onBlur(parsedValue);
        }
    }, [decimalPlaces, min, max, onBlur, onValidationChange]);

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
        
        // Allow % symbol (key code 37 with shift)
        if (e.keyCode === 53 && e.shiftKey) {
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
            placeholder={placeholder}
            style={style}
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*%?"
            {...rest}
        />
    );
};

export default PercentageInput;
