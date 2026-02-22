import React, { memo, useCallback } from 'react';
import { FormGroup, FormLabel } from 'react-bootstrap';
import StyledFormText from '../styled/CommonStyled';
import InputWrapper from '../common/InputWrapper';
import { renderWarningMessage } from '../common/FormValidation';
import { FieldRegistry } from './FieldRegistry';
import type { FieldConfig, FormContextType } from '../../types/dynamicForm';
import type { OptionsRegistry } from '../../hooks/useOptionsRegistry';

interface DynamicFieldProps {
    /** Field configuration from profile */
    config: FieldConfig;
    /** Form context with all form operations */
    formContext: FormContextType;
    /** Options registry for select fields */
    optionsRegistry: OptionsRegistry;
}

/**
 * DynamicField Component
 *  
 * Renders a single form field based on configuration.
 * Automatically handles:
 * - Loading/error state display
 * - Field label and help text
 * - Component lookup from FieldRegistry
 * - Options resolution for select fields
 * 
 * Memoized to prevent unnecessary re-renders when other fields change.
 */
const DynamicFieldInner: React.FC<DynamicFieldProps> = ({
    config,
    formContext,
    optionsRegistry,
}) => {
    const FieldComponent = FieldRegistry[config.reactComponent];

    // Memoize onChange handler
    const handleChange = useCallback(
        (val: unknown) => formContext.handleChange(config.key, val),
        [formContext.handleChange, config.key]
    );

    // Memoize onBlur handler
    const handleBlur = useCallback(
        (val: unknown) => formContext.handleBlur(config.key, val),
        [formContext.handleBlur, config.key]
    );

    if (!FieldComponent) {
        console.warn(`DynamicField: Unknown component "${config.reactComponent}" for field "${config.key}"`);
        return null;
    }

    // Resolve options for select/autocomplete fields
    const options = config.options?.source
        ? optionsRegistry[config.options.source]
        : undefined;

    const fieldValue = formContext.getValue(config.key);
    const fieldError = formContext.getError(config.key);
    const isFieldLoading = formContext.isLoading(config.key);

    return (
        <FormGroup controlId={config.key} className="mb-3">
            <FormLabel>{config.alias}</FormLabel>
            <InputWrapper
                isLoading={isFieldLoading}
                rightIcon={renderWarningMessage(fieldError)}
            >
                <FieldComponent
                    config={config}
                    value={fieldValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={fieldError}
                    disabled={formContext.disabled || config.disabled}
                    options={options as unknown[]}
                    formContext={formContext}
                />
            </InputWrapper>
            {config.fieldInfo && (
                <StyledFormText>{config.fieldInfo}</StyledFormText>
            )}
        </FormGroup>
    );
};

// Memoize the component to prevent unnecessary re-renders
export const DynamicField = memo(DynamicFieldInner, (prevProps, nextProps) => {
    // Re-render if config changed
    if (prevProps.config !== nextProps.config) {
        return false;
    }
    // Re-render if this field's value changed
    const prevValue = prevProps.formContext.getValue(prevProps.config.key);
    const nextValue = nextProps.formContext.getValue(nextProps.config.key);
    if (prevValue !== nextValue) {
        return false;
    }
    // Re-render if disabled state changed
    if (prevProps.formContext.disabled !== nextProps.formContext.disabled) {
        return false;
    }
    // Re-render if loading state changed for this field
    if (prevProps.formContext.isLoading(prevProps.config.key) !== nextProps.formContext.isLoading(nextProps.config.key)) {
        return false;
    }
    // Re-render if error state changed for this field
    if (prevProps.formContext.getError(prevProps.config.key) !== nextProps.formContext.getError(nextProps.config.key)) {
        return false;
    }
    // Re-render if options changed for this field
    const prevOptions = prevProps.config.options?.source
        ? prevProps.optionsRegistry[prevProps.config.options.source]
        : undefined;
    const nextOptions = nextProps.config.options?.source
        ? nextProps.optionsRegistry[nextProps.config.options.source]
        : undefined;
    if (prevOptions !== nextOptions) {
        return false;
    }
    // No changes detected, don't re-render
    return true;
});

export default DynamicField;

