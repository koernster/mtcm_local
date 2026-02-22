import React from 'react';
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
 */
export const DynamicField: React.FC<DynamicFieldProps> = ({
    config,
    formContext,
    optionsRegistry,
}) => {
    const FieldComponent = FieldRegistry[config.reactComponent];

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
                    onChange={(val) => formContext.handleChange(config.key, val)}
                    onBlur={(val) => formContext.handleBlur(config.key, val)}
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

export default DynamicField;
