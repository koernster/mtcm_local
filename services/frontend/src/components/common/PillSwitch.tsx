import React, { useMemo } from 'react';
import { ButtonGroup, ToggleButton, Spinner } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

/**
 * PillSwitch - A reusable capsule-shaped toggle switch component
 * 
 * Features:
 * - 100% rounded edges (capsule design)
 * - Smooth transitions and hover effects
 * - Support for mixed states
 * - Customizable variants and sizes
 * - Fully accessible
 * 
 * @example
 * // Basic usage
 * <PillSwitch
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   value={selectedValue}
 *   onChange={handleChange}
 *   name="my-switch"
 * />
 * 
 * @example
 * // With mixed state support
 * <PillSwitch
 *   options={[
 *     { value: 'all', label: 'All' },
 *     { value: 'none', label: 'None' }
 *   ]}
 *   value={allSelected ? 'all' : noneSelected ? 'none' : null}
 *   onChange={handleChange}
 *   name="select-all"
 *   showMixed={true}
 * />
 */

interface PillSwitchOption {
    value: string | number | boolean;
    label: string | React.ReactNode; // Allow string or React node for custom labels
    variant?: string;
}

interface PillSwitchProps {
    options: PillSwitchOption[];
    value: string | number | boolean | null;
    onChange: (value: string | number | boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'lg';
    name: string;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    showMixed?: boolean; // Show mixed state when no option is fully selected
    isLoading?: boolean; // Show loading spinner
}

const PillSwitch: React.FC<PillSwitchProps> = ({
    options,
    value,
    onChange,
    disabled = false,
    size = 'sm',
    name,
    className = '',
    style = {},
    title,
    showMixed = false,
    isLoading = false
}) => {
    const { theme } = useTheme();
    
    const defaultStyle = useMemo(() => ({
        borderRadius: '50px', // Full capsule shape
        overflow: 'hidden',
        border: 'none',
        ...style
    }), [style]);

    const buttonStyle = useMemo(() => ({
        borderRadius: '50px',
        border: 'none',
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        padding: size === 'sm' ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
        transition: 'all 0.3s ease',
        fontWeight: '500',
        minWidth: size === 'sm' ? '50px' : '70px',
        whiteSpace: 'nowrap' as const,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    }), [size]);

    const hasSelection = value !== null && value !== undefined;

    const getButtonStyle = useMemo(() => (option: PillSwitchOption, isSelected: boolean, index: number) => {
        const baseStyle = {
            ...buttonStyle,
            // Handle border radius for seamless capsule
            borderRadius: options.length === 1 
                ? '50px' 
                : index === 0 
                    ? '50px 0 0 50px' 
                    : index === options.length - 1 
                        ? '0 50px 50px 0' 
                        : '0',
            zIndex: isSelected ? 2 : 1,
            boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            opacity: showMixed && !hasSelection ? 0.7 : 1,
        };

        if (isSelected) {
            return {
                ...baseStyle,
                backgroundColor: theme.primary,
                color: '#ffffff',
                borderColor: theme.primary,
                border: `1px solid ${theme.primary}`,
                ':hover': !disabled ? {
                    backgroundColor: theme.primaryHover || theme.primary,
                    borderColor: theme.primaryHover || theme.primary,
                } : {},
            };
        } else {
            return {
                ...baseStyle,
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
                border: `1px solid ${theme.border}`,
                borderRight: index < options.length - 1 ? `1px solid ${theme.border}` : 'none',
                ':hover': !disabled ? {
                    backgroundColor: theme.hoverLight || theme.background,
                    borderColor: theme.hover || theme.border,
                } : {},
            };
        }
    }, [buttonStyle, options.length, showMixed, theme, disabled, hasSelection]);

    const mixedStyle = useMemo(() => showMixed && !hasSelection ? {
        opacity: 0.6,
        border: `2px dashed ${theme.warning}`,
        borderRadius: '50px',
    } : {}, [showMixed, hasSelection, theme.warning]);

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ButtonGroup 
                size={size} 
                className={className}
                style={{...defaultStyle, ...mixedStyle}}
                title={title}
            >
                {options.map((option, index) => {
                    const isSelected = value === option.value;
                    
                    return (
                        <ToggleButton
                            key={`${name}-${option.value}`}
                            id={`${name}-${option.value}`}
                            type="radio"
                            variant="light" // Use light variant to override Bootstrap defaults
                            name={name}
                            value={String(option.value)}
                            checked={isSelected}
                            onChange={() => onChange(option.value)}
                            disabled={disabled || isLoading}
                            style={getButtonStyle(option, isSelected, index)}
                        >
                            {option.label}
                        </ToggleButton>
                    );
                })}
            </ButtonGroup>
            
            {isLoading && (
                <Spinner 
                    animation="border" 
                    size="sm" 
                    style={{ 
                        width: '16px',
                        height: '16px',
                        color: theme.textMuted
                    }}
                />
            )}
        </div>
    );
};

export default PillSwitch;
