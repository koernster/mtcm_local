/**
 * SwitchableInput Field Component
 * 
 * A dynamic form field that combines a PillSwitch for type selection
 * and an input field for value entry.
 * 
 * DATABASE FIELDS (two separate database columns):
 * - key (e.g., "performance"): stores the numeric/text value
 * - typeField (e.g., "performancetype"): stores the selected type from switch
 * 
 * SAVE BEHAVIOR:
 * - Both fields trigger save on change (handleChange + handleBlur)
 * - When type changes, value is cleared and both fields are saved
 * 
 * Supported inputType values:
 * - "dynamic": Switches between percentage/currency based on switch selection
 * - "percentage": Always renders percentage input
 * - "currency": Always renders currency input
 * - "text": Renders a plain text input
 * 
 * Configuration in JSON:
 * {
 *   "key": "performance",              // <- VALUE database field
 *   "name": "Performance",
 *   "alias": "Performance",
 *   "fieldInfo": "Performance metric",
 *   "reactComponent": "SwitchableInput",
 *   "required": true,
 *   "props": {
 *     "typeField": "performancetype",  // <- TYPE database field
 *     "switchOptions": [
 *       { "value": "0", "icon": "FaPercentage" },
 *       { "value": "1", "icon": "FaHashtag" }
 *     ],
 *     "inputType": "dynamic",
 *     "min": 0,
 *     "max": 100
 *   }
 * }
 */
import React, { useCallback, useMemo, useRef } from 'react';
import { FaPercentage, FaHashtag } from 'react-icons/fa';
import PillSwitch from '../common/PillSwitch';
import PercentageInput from '../common/PercentageInput';
import { StyledFormControl } from '../styled/CommonStyled';
import { getFieldErrorStyle } from '../common/FormValidation';
import { FIELD_TYPES } from '../../types/common/fieldTypes';
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
        // Default switch options - Percentage and Number
        return [
            { value: String(FIELD_TYPES.PERCENTAGE), icon: 'FaPercentage' },
            { value: String(FIELD_TYPES.AMOUNT), icon: 'FaHashtag' },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [switchOptionsJson]);

    // Get current type value directly from formContext
    const typeValue = formContext?.getValue(typeField);

    // Convert to string for comparison with switch options (handles both string and number from DB)
    const currentTypeString = typeValue !== null && typeValue !== undefined
        ? String(typeValue)
        : switchOptions[0]?.value || '0';  // Default to first option

    // Determine if current selection is "percentage-like" (first option)
    // This controls which input type to render when inputType is "dynamic"
    const isPercentage = currentTypeString === switchOptions[0]?.value;

    // Use ref to avoid stale closure issues with formContext
    const formContextRef = useRef(formContext);
    formContextRef.current = formContext;

    // Handle type change - use ref to avoid formContext in dependencies
    const handleTypeChange = useCallback((newType: string | number | boolean) => {
        if (!typeField) {
            console.warn('SwitchableInput: typeField not configured');
            return;
        }

        // Clear the value when type changes and trigger save
        const ctx = formContextRef.current;
        if (ctx) {
            // Clear value field
            ctx.handleChange(config.key, null);
            ctx.handleBlur(config.key, null);

            // Update the type field
            ctx.handleChange(typeField, newType as string);
            ctx.handleBlur(typeField, newType as string);
        }
    }, [typeField, config.key]);

    // Handle value change - triggers change in Redux
    const handleValueChange = useCallback((newValue: number | null) => {
        const ctx = formContextRef.current;
        if (ctx) {
            ctx.handleChange(config.key, newValue);
        }
    }, [config.key]);

    // Handle value blur - triggers save to database
    const handleValueBlur = useCallback((newValue: number | null) => {
        const ctx = formContextRef.current;
        if (ctx) {
            ctx.handleBlur(config.key, newValue);
        }
    }, [config.key]);

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

        // If inputType is 'dynamic', choose based on currentType (first switch option = percentage)
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

        // Plain number input (for inputType 'number' or 'dynamic' with second option)
        // Uses StyledFormControl with type="number" for simple numeric input
        return (
            <StyledFormControl
                type="number"
                value={value !== null && value !== undefined ? String(value) : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    handleValueChange(val);
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    handleValueBlur(val);
                }}
                style={getFieldErrorStyle(error)}
                disabled={disabled || formContext?.isLoading(config.key)}
                required={config.required}
                placeholder={props.placeholder as string || "0"}
                name={`${config.key}_input`}
                min={min}
            />
        );
    };

    return (
        <Container>
            <SwitchRow>
                <PillSwitch
                    options={pillSwitchOptions}
                    value={currentTypeString}
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
