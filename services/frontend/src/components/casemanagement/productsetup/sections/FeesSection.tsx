/**
 * FeesSection Component
 * 
 * Renders fee fields with percentage/amount toggle switches.
 * Includes global type toggle in header.
 * Used as a custom section in dynamic form configuration.
 */
import React, { useCallback } from 'react';
import { Row, Col, FormGroup, FormLabel, Spinner } from 'react-bootstrap';
import { FaMoneyBillAlt, FaPercentage } from 'react-icons/fa';
import StyledFormText, { KanbanContainer, StyledCardHeader, StyledCardBody } from '../../../styled/CommonStyled';
import InputWrapper from '../../../common/InputWrapper';
import PercentageInput from '../../../common/PercentageInput';
import FormattedCurrencyInput from '../../../common/FormattedCurrencyInput';
import PillSwitch from '../../../common/PillSwitch';
import { getFieldErrorStyle, renderWarningMessage } from '../../../common/FormValidation';
import { FIELD_TYPES, FieldType, getFieldType, isPercentageType } from '../../../../types/common/fieldTypes';
import type { CustomSectionProps } from '../../../../types/dynamicForm';

interface FieldConfig {
    field: string;
    typeField: string;
    label: string;
    required?: boolean;
    description: string;
}

const FEE_FIELDS: FieldConfig[] = [
    { field: 'setupfee', typeField: 'setupfeetype', label: 'Set Up Fee', required: true, description: 'Initial setup fee for the product' },
    { field: 'adminfee', typeField: 'adminfeetype', label: 'Admin Fee', required: true, description: 'Ongoing administrative fee' },
    { field: 'managementfee', typeField: 'managementfeetype', label: 'Management Fee', required: true, description: 'Ongoing management fee' },
    { field: 'salesfee', typeField: 'salesfeetype', label: 'Sales Fee', required: false, description: 'Sales commission fee' },
    { field: 'performancefee', typeField: 'performancefeetype', label: 'Performance Fee', required: false, description: 'Performance-based fee' },
    { field: 'otherfees', typeField: 'otherfeestype', label: 'Other Fees', required: false, description: 'Additional fees if any' },
];

const FeesSection: React.FC<CustomSectionProps> = ({ formContext }) => {
    const { caseData, disabled, loadingStates, errorStates, dispatch, handleBlur, setFieldError } = formContext;
    const { updateCaseData } = require('../../../../store/slices/caseSetupSlice');

    const caseFee = (caseData as any)?.casefee || {};
    const [globalLoading, setGlobalLoading] = React.useState(false);

    const getFieldTypeValue = useCallback((typeField: string): FieldType => {
        const fieldType = caseFee[typeField];
        return getFieldType(fieldType);
    }, [caseFee]);

    // Check if all fee types are the same
    const getAllFeeTypesStatus = useCallback((): { allSame: boolean; currentType: FieldType | null } => {
        const types = FEE_FIELDS.map(config => getFieldTypeValue(config.typeField));
        const uniqueTypes = [...new Set(types)];
        return {
            allSame: uniqueTypes.length === 1,
            currentType: uniqueTypes.length === 1 ? uniqueTypes[0] : null
        };
    }, [getFieldTypeValue]);

    const handleFieldValueChange = useCallback((field: string, value: number | null) => {
        (dispatch as Function)(updateCaseData({
            casefee: { ...caseFee, [field]: value || undefined }
        }));
    }, [caseFee, dispatch, updateCaseData]);

    const handleFieldTypeChange = useCallback((field: string, typeField: string, newType: FieldType) => {
        setFieldError(field, null);
        (dispatch as Function)(updateCaseData({
            casefee: { ...caseFee, [typeField]: newType, [field]: undefined }
        }));
        handleBlur(typeField, newType);
    }, [caseFee, dispatch, handleBlur, setFieldError, updateCaseData]);

    // Global type change handler
    const handleGlobalTypeChange = useCallback(async (newType: FieldType) => {
        setGlobalLoading(true);
        try {
            const updates: Record<string, unknown> = { ...caseFee };
            FEE_FIELDS.forEach(config => {
                updates[config.typeField] = newType;
                updates[config.field] = undefined;
                setFieldError(config.field, null);
            });
            (dispatch as Function)(updateCaseData({ casefee: updates }));
            for (const config of FEE_FIELDS) {
                await handleBlur(config.typeField, newType);
            }
        } finally {
            setGlobalLoading(false);
        }
    }, [caseFee, dispatch, handleBlur, setFieldError, updateCaseData]);

    const renderInput = (config: FieldConfig) => {
        const { field, typeField, required } = config;
        const fieldType = getFieldTypeValue(typeField);
        const currentValue = caseFee[field];
        const isFieldDisabled = globalLoading || loadingStates[field] || loadingStates[typeField] || disabled;

        if (isPercentageType(fieldType)) {
            return (
                <PercentageInput
                    required={required}
                    min={0}
                    max={100}
                    value={currentValue || null}
                    onChange={(value: number | null) => handleFieldValueChange(field, value)}
                    onBlur={(value: number | null) => handleBlur(field, value)}
                    style={getFieldErrorStyle(errorStates[field])}
                    disabled={isFieldDisabled}
                    name={`${field}_${fieldType}`}
                />
            );
        }
        return (
            <FormattedCurrencyInput
                required={required}
                min={0}
                showSymbol={false}
                value={currentValue || null}
                onChange={(value: number | null) => handleFieldValueChange(field, value)}
                onBlur={(value: number | null) => handleBlur(field, value)}
                style={getFieldErrorStyle(errorStates[field])}
                placeholder="0.00"
                disabled={isFieldDisabled}
                name={`${field}_${fieldType}`}
            />
        );
    };

    const renderTypeToggle = (config: FieldConfig) => {
        const { field, typeField } = config;
        const currentType = getFieldTypeValue(typeField);

        return (
            <PillSwitch
                options={[
                    { value: FIELD_TYPES.PERCENTAGE, label: <FaPercentage /> },
                    { value: FIELD_TYPES.AMOUNT, label: <FaMoneyBillAlt /> }
                ]}
                value={currentType}
                onChange={(value: string) => handleFieldTypeChange(field, typeField, value as FieldType)}
                disabled={globalLoading || disabled}
                isLoading={loadingStates[typeField]}
                name={`${field}-type`}
                className="mb-2"
                size="sm"
            />
        );
    };

    const renderGlobalTypeToggle = () => {
        const { allSame, currentType } = getAllFeeTypesStatus();

        return (
            <div className="d-flex align-items-center">
                <span className="me-2" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    All Fees:
                </span>
                {!globalLoading && (
                    <PillSwitch
                        options={[
                            { value: FIELD_TYPES.PERCENTAGE, label: <span> All <FaPercentage /></span> },
                            { value: FIELD_TYPES.AMOUNT, label: <span> All Amount(<FaMoneyBillAlt />) </span> }
                        ]}
                        value={allSame ? currentType : null}
                        onChange={(value: string) => handleGlobalTypeChange(value as FieldType)}
                        disabled={disabled}
                        isLoading={globalLoading}
                        name="global-fee-type"
                        showMixed={!allSame}
                    />
                )}
                {!allSame && !globalLoading && (
                    <span className="ms-2" style={{ fontSize: '0.75rem', color: '#ffc107' }}>
                        Mixed
                    </span>
                )}
                {globalLoading && (
                    <Spinner animation="border" size="sm" style={{ width: '16px', height: '16px' }} />
                )}
            </div>
        );
    };

    const renderFeeField = (config: FieldConfig) => {
        const { field, label, description } = config;
        const feeType = getFieldTypeValue(config.typeField);
        const rangeText = isPercentageType(feeType) ? ' (0-100%)' : ' (min: 0)';

        return (
            <Col sm={6} md={6} xs={6} key={field}>
                <FormGroup controlId={field}>
                    <FormLabel>{label} </FormLabel>
                    &nbsp;{renderTypeToggle(config)}
                    <InputWrapper
                        isLoading={loadingStates[field]}
                        rightIcon={renderWarningMessage(errorStates[field])}
                    >
                        {renderInput(config)}
                    </InputWrapper>
                    <StyledFormText>{description}{rangeText}</StyledFormText>
                </FormGroup>
            </Col>
        );
    };

    return (
        <Row className="mb-3">
            <KanbanContainer>
                <StyledCardHeader as="h6" className="d-flex justify-content-between align-items-center">
                    <span>Fees</span>
                    {renderGlobalTypeToggle()}
                </StyledCardHeader>
                <StyledCardBody>
                    <Row>
                        {FEE_FIELDS.slice(0, 2).map(config => renderFeeField(config))}
                    </Row>
                    <Row className="mt-3">
                        {FEE_FIELDS.slice(2, 4).map(config => renderFeeField(config))}
                    </Row>
                    <Row className="mt-3">
                        {FEE_FIELDS.slice(4).map(config => renderFeeField(config))}
                    </Row>
                </StyledCardBody>
            </KanbanContainer>
        </Row>
    );
};

export default FeesSection;
