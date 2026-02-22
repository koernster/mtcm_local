import React from 'react';
import { StyledFormControl, StyledSelect } from '../styled/CommonStyled';
import PercentageInput from '../common/PercentageInput';
import FormattedCurrencyInput from '../common/FormattedCurrencyInput';
import { getFieldErrorStyle } from '../common/FormValidation';
import SwitchableInput from './SwitchableInput';
import type { FieldConfig, FieldProps } from '../../types/dynamicForm';

/**
 * Text Input Field
 */
const TextInput: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
}) => (
    <StyledFormControl
        type="text"
        value={(value as string) || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => onBlur(e.target.value)}
        style={getFieldErrorStyle(error)}
        disabled={disabled}
        placeholder={config.props?.placeholder as string}
        required={config.required}
    />
);

/**
 * Date Input Field
 */
const DateInput: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
}) => (
    <StyledFormControl
        type="date"
        value={(value as string) || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => onBlur(e.target.value)}
        style={getFieldErrorStyle(error)}
        disabled={disabled}
        required={config.required}
    />
);

/**
 * Select Input Field
 * Supports excluding specific options via config.options.excludeValues
 */
const SelectInput: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    options = [],
}) => {
    const valueKey = (config.options?.valueKey || 'id') as string;
    const labelKey = (config.options?.labelKey || 'name') as string;
    const excludeValues = (config.options?.excludeValues || []) as string[];

    // Filter out excluded options
    const filteredOptions = (options as Record<string, unknown>[]).filter((opt) => {
        const optionValue = String(opt[valueKey]);
        return !excludeValues.includes(optionValue);
    });

    return (
        <StyledSelect
            value={(value as string) || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const newValue = e.target.value;
                onChange(newValue);
                onBlur(newValue);
            }}
            style={getFieldErrorStyle(error)}
            disabled={disabled}
            required={config.required}
        >
            <option value="">Select {config.alias}</option>
            {filteredOptions.map((opt) => (
                <option key={String(opt[valueKey])} value={String(opt[valueKey])}>
                    {String(opt[labelKey])}
                </option>
            ))}
        </StyledSelect>
    );
};

/**
 * Percentage Input Field Wrapper
 */
const PercentageField: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
}) => (
    <PercentageInput
        min={(config.props?.min as number) ?? 0}
        max={(config.props?.max as number) ?? 100}
        value={value as number | null}
        onChange={(val) => onChange(val)}
        onBlur={(val) => onBlur(val)}
        style={getFieldErrorStyle(error)}
        disabled={disabled}
        required={config.required}
    />
);

/**
 * Currency Input Field Wrapper
 */
const CurrencyField: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
}) => (
    <FormattedCurrencyInput
        min={(config.props?.min as number) ?? 0}
        currency={config.props?.currency as string}
        showSymbol={(config.props?.showSymbol as boolean) ?? false}
        value={value as number | null}
        onChange={(val) => onChange(val)}
        onBlur={(val) => onBlur(val)}
        style={getFieldErrorStyle(error)}
        disabled={disabled}
        required={config.required}
        placeholder={config.props?.placeholder as string}
    />
);

/**
 * Autocomplete Input Field
 * Uses ServiceRegistry to dynamically call search methods.
 */
const AutocompleteField: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
}) => {
    const { autocomplete } = config;

    if (!autocomplete) {
        console.warn(`AutocompleteField: No autocomplete config for field "${config.key}"`);
        return null;
    }

    // Import dynamically to avoid circular dependency
    const { getSearchFunction } = require('./ServiceRegistry');
    const searchFn = getSearchFunction(autocomplete.searchService, autocomplete.searchMethod);

    if (!searchFn) {
        console.warn(`AutocompleteField: Could not get search function for "${autocomplete.searchService}.${autocomplete.searchMethod}"`);
        return null;
    }

    // Dynamic import of Autocomplete to avoid circular dependency
    const { Autocomplete } = require('../common/Autocomplete');

    return (
        <Autocomplete
            value={(value as string) || ''}
            onChange={(val: string) => onChange(val)}
            onSelect={(item: Record<string, unknown>) => {
                const newValue = item[autocomplete.valueKey];
                onChange(newValue);
                onBlur(newValue);
            }}
            onSearch={searchFn}
            getOptionLabel={(opt: Record<string, unknown>) => String(opt[autocomplete.labelKey] || '')}
            placeholder={autocomplete.placeholder}
            minLength={autocomplete.minLength ?? 2}
            debounceMs={autocomplete.debounceMs ?? 300}
            disabled={disabled}
            error={!!error}
            errorMessage={error}
            createNewLabel={autocomplete.createNew?.label}
        />
    );
};

/**
 * Field Registry
 * Maps component names (from JSON config) to actual React components.
 */
export const FieldRegistry: Record<string, React.FC<FieldProps>> = {
    TextInput,
    DateInput,
    SelectInput,
    PercentageInput: PercentageField,
    CurrencyInput: CurrencyField,
    AutocompleteInput: AutocompleteField,
    SwitchableInput,
};

/**
 * Get a field component from the registry.
 * Returns undefined if component is not found.
 */
export const getFieldComponent = (componentName: string): React.FC<FieldProps> | undefined => {
    return FieldRegistry[componentName];
};

export default FieldRegistry;

