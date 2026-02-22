/**
 * SwitchableInput Field Component
 * 
 * A dynamic form field that combines a PillSwitch for type selection
 * and an input field for value entry. Supports binding to two database fields:
 * - typeField: stores the selected type (e.g., 'Percentage' or 'Amount')
 * - key: stores the value (numeric or text depending on inputType)
 * 
 * Supported inputType values:
 * - "dynamic": Switches between percentage/currency based on switch selection
 * - "percentage": Always renders percentage input
 * - "currency": Always renders currency input
 * - "text": Renders a plain text input
 * 
 * Configuration in JSON:
 * {
 *   "key": "managementfee",
 *   "name": "ManagementFee",
 *   "alias": "Management Fee",
 *   "fieldInfo": "Management fee for the product",
 *   "reactComponent": "SwitchableInput",
 *   "required": true,
 *   "props": {
 *     "typeField": "managementfeetype",
 *     "switchOptions": [
 *       { "value": "Percentage", "label": "%", "icon": "FaPercentage" },
 *       { "value": "Amount", "label": "$", "icon": "FaMoneyBillAlt" }
 *     ],
 *     "inputType": "dynamic",  // "dynamic", "percentage", "currency", or "text"
 *     "min": 0,
 *     "max": 100,  // for percentage type
 *     "placeholder": "Enter value"  // for text type
 *   }
 * }
 */
import React, { useCallback, useMemo, useRef } from 'react';
import { FaPercentage, FaMoneyBillAlt, FaHashtag } from 'react-icons/fa';
import PillSwitch from '../common/PillSwitch';
import PercentageInput from '../common/PercentageInput';
import FormattedCurrencyInput from '../common/FormattedCurrencyInput';
import { StyledFormControl } from '../styled/CommonStyled';
import { getFieldErrorStyle } from '../common/FormValidation';
import { FIELD_TYPES, FieldType, isPercentageType, getFieldType } from '../../types/common/fieldTypes';
import type { FieldProps } from '../../types/dynamicForm';
import styled from 'styled-components';

interface SwitchOption {
    value: string;
    label?: string;
    icon?: 'FaPercentage' | 'FaMoneyBillAlt' | 'FaHashtag';
}

// Icon mapping
const IconMap: Record<string, React.ReactNode> = {
    FaPercentage: <FaPercentage />,
    FaMoneyBillAlt: <FaMoneyBillAlt />,
    FaHashtag: <FaHashtag />,
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const SwitchRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InputRow = styled.div`
    flex: 1;
`;

/**
 * SwitchableInput Component
 * 
 * Renders a pill switch for type selection and corresponding input field.
 * The input type changes based on the selected switch value.
 */
const SwitchableInput: React.FC<FieldProps> = ({
    config,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    formContext,
}) => {
    const props = config.props || {};
    const typeField = props.typeField as string;
    const inputType = (props.inputType as string) || 'dynamic';
    const min = (props.min as number) ?? 0;
    const max = (props.max as number) ?? 100;

    // Stringify for stable dependency (props.switchOptions may be new object each render)
    const switchOptionsJson = JSON.stringify(props.switchOptions);

    // Memoize switch options to prevent recreation on every render
    const switchOptions = useMemo<SwitchOption[]>(() => {
        const configuredOptions = props.switchOptions as SwitchOption[] | undefined;
        if (configuredOptions && configuredOptions.length > 0) {
            return configuredOptions;
        }
        // Default switch options - using string representations of the numeric FIELD_TYPES
        return [
            { value: String(FIELD_TYPES.PERCENTAGE), icon: 'FaPercentage' },
            { value: String(FIELD_TYPES.AMOUNT), icon: 'FaMoneyBillAlt' },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [switchOptionsJson]);

    // Get current type value directly (not in useCallback to avoid stale closures)
    const typeValue = formContext?.getValue(typeField);
    const currentType = getFieldType(typeValue as string);
    const isPercentage = isPercentageType(currentType);

    // Use ref to avoid stale closure issues with formContext
    const formContextRef = useRef(formContext);
    formContextRef.current = formContext;

    // Handle type change - use ref to avoid formContext in dependencies
    const handleTypeChange = useCallback((newType: string | number | boolean) => {
        if (!typeField) {
            console.warn('SwitchableInput: typeField not configured');
            return;
        }

        // Clear the value when type changes
        onChange(null);

        // Update the type field via formContext if available
        const ctx = formContextRef.current;
        if (ctx) {
            ctx.handleChange(typeField, newType as string);
            ctx.handleBlur(typeField, newType as string);
        }
    }, [typeField, onChange]);

    // Handle value change
    const handleValueChange = useCallback((newValue: number | null) => {
        onChange(newValue);
    }, [onChange]);

    // Handle value blur
    const handleValueBlur = useCallback((newValue: number | null) => {
        onBlur(newValue);
    }, [onBlur]);

    // Memoize pill switch options to prevent unnecessary re-renders
    const pillSwitchOptions = useMemo(() =>
        switchOptions.map(opt => ({
            value: opt.value,
            label: opt.icon ? IconMap[opt.icon] : opt.label || opt.value,
        })),
        [switchOptions]
    );

    // Determine which input to render based on inputType and currentType
    const renderInput = () => {
        // Text input type
        if (inputType === 'text') {
            return (
                <StyledFormControl
                    type="text"
                    value={(value as string) || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => onBlur(e.target.value)}
                    style={getFieldErrorStyle(error)}
                    disabled={disabled || formContext?.isLoading(config.key)}
                    required={config.required}
                    placeholder={props.placeholder as string}
                    name={`${config.key}_input`}
                />
            );
        }

        // If inputType is 'dynamic', choose based on currentType
        const shouldUsePercentage = inputType === 'percentage' ||
            (inputType === 'dynamic' && isPercentage);

        if (shouldUsePercentage) {
            return (
                <PercentageInput
                    min={min}
                    max={max}
                    value={value as number | null}
                    onChange={handleValueChange}
                    onBlur={handleValueBlur}
                    style={getFieldErrorStyle(error)}
                    disabled={disabled || formContext?.isLoading(config.key)}
                    required={config.required}
                    name={`${config.key}_input`}
                />
            );
        }

        return (
            <FormattedCurrencyInput
                min={min}
                showSymbol={false}
                value={value as number | null}
                onChange={handleValueChange}
                onBlur={handleValueBlur}
                style={getFieldErrorStyle(error)}
                disabled={disabled || formContext?.isLoading(config.key)}
                required={config.required}
                placeholder="0.00"
                name={`${config.key}_input`}
            />
        );
    };

    return (
        <Container>
            <SwitchRow>
                <PillSwitch
                    options={pillSwitchOptions}
                    value={String(currentType)}
                    onChange={handleTypeChange}
                    disabled={disabled || (formContext?.isLoading(typeField || '') ?? false)}
                    isLoading={formContext?.isLoading(typeField || '') ?? false}
                    name={`${config.key}-type-switch`}
                    size="sm"
                />
            </SwitchRow>
            <InputRow>
                {renderInput()}
            </InputRow>
        </Container>
    );
};

export default SwitchableInput;
