import React from 'react';
import { StyledFormControl } from '../styled/CommonStyled';
import { dateUtils } from '../../utils/formatters';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    disableWeekends?: boolean;
    required?: boolean;
    style?: React.CSSProperties;
    [key: string]: any;
}

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    onBlur,
    disabled = false,
    disableWeekends = false,
    required = false,
    style,
    ...rest
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        
        if (disableWeekends && selectedDate) {
            const parsedDate = dateUtils.parse(selectedDate);
            if (parsedDate && dateUtils.isWeekend(parsedDate)) {
                return;
            }
        }
        
        onChange(selectedDate);
    };

    const isWeekend = (dateString: string) => {
        if (!dateString) return false;
        const parsedDate = dateUtils.parse(dateString);
        return parsedDate ? dateUtils.isWeekend(parsedDate) : false;
    };

    return (
        <StyledFormControl
            type="date"
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled || (disableWeekends && isWeekend(value))}
            required={required}
            style={{
                ...style,
                ...(disableWeekends && isWeekend(value) ? { backgroundColor: '#f8f9fa', color: '#6c757d' } : {})
            }}
            {...rest}
        />
    );
};

export default DatePicker;
