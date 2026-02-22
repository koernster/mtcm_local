import React, { useMemo, useCallback, useEffect } from 'react';
import { Row, Col, FormGroup, FormLabel, Button } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { FaPercentage, FaMoneyBillAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { addBasketAsset, removeBasketAsset, updateBasketAsset } from '../../../../store/slices/caseSetupSlice';
import StyledFormText, { StyledFormControl, KanbanContainer, StyledCardHeader, StyledCardBody } from '../../../styled/CommonStyled';
import InputWrapper from '../../../common/InputWrapper';
import PercentageInput from '../../../common/PercentageInput';
import FormattedCurrencyInput from '../../../common/FormattedCurrencyInput';
import PillSwitch from '../../../common/PillSwitch';
import { renderWarningMessage, getFieldErrorStyle } from '../../../common/FormValidation';
import { FIELD_TYPES, FieldType, getFieldType, isPercentageType } from '../../../../types/common/fieldTypes';
import CaseService from '../../../../services/api/graphQL/cases/service';
import type { CustomSectionProps } from '../../../../types/dynamicForm';

/**
 * BasketAssetsSection Component
 * 
 * A custom section for managing basket investment assets.
 * Shows only when investment type is "Basket".
 */
const BasketAssetsSection: React.FC<CustomSectionProps> = ({ formContext }) => {
    const dispatch = useDispatch();
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const activeCaseId = useSelector((state: RootState) => state.caseSetup.activeCaseId);

    // Get basket assets from case data
    const basketAssets = useMemo(() => {
        return caseData?.case_assetbaskets || [];
    }, [caseData?.case_assetbaskets]);

    // Check if investment type is Basket
    const investmentTypeName = useMemo(() => {
        return caseData?.investmenttype?.typename;
    }, [caseData?.investmenttype?.typename]);

    const isBasketInvestment = investmentTypeName === 'Basket';

    // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS

    // Handlers - defined before early return
    const handleAddBasketAsset = useCallback(() => {
        const newAsset = {
            id: 'new' + Date.now(),
            assetname: '',
            assetvalue: 0,
            valuetype: FIELD_TYPES.PERCENTAGE,
            caseid: activeCaseId
        };
        dispatch(addBasketAsset(newAsset));
    }, [activeCaseId, dispatch]);

    const handleRemoveBasketAsset = useCallback((index: number) => {
        dispatch(removeBasketAsset(index));

        const currentBasketAssets = caseData?.case_assetbaskets || [];
        const assetToRemove = currentBasketAssets[index];

        if (assetToRemove?.id && typeof assetToRemove.id === 'string' && !assetToRemove.id.startsWith('new')) {
            CaseService.getInstance().deleteBasketAsset(assetToRemove.id);
        }
    }, [dispatch, caseData?.case_assetbaskets]);

    const handleUpdateBasketAsset = useCallback((index: number, field: string, value: unknown) => {
        const currentBasketAssets = caseData?.case_assetbaskets || [];
        const currentAsset = currentBasketAssets[index];
        const updatedAsset = {
            ...currentAsset,
            [field]: value,
            id: currentAsset?.id ?? 'new' + Date.now()
        };
        dispatch(updateBasketAsset({ index, asset: updatedAsset }));
    }, [dispatch, caseData?.case_assetbaskets]);

    const handleAssetValueTypeChange = useCallback((index: number, newType: FieldType) => {
        const currentBasketAssets = caseData?.case_assetbaskets || [];
        const currentAsset = currentBasketAssets[index];

        formContext.setFieldError(`asset_value_${currentAsset.id}`, null);

        formContext.handleBlur(`value_type_${currentAsset.id}`, newType).then(() => {
            setTimeout(() => {
                const inputSelector = `input[name="assetValue_${currentAsset.id}_${newType}"]`;
                const inputElement = document.querySelector(inputSelector) as HTMLInputElement;
                if (inputElement) {
                    inputElement.focus();
                }
            }, 50);
        });
    }, [caseData?.case_assetbaskets, formContext]);

    const handlePercentageValidation = useCallback((fieldName: string, _isValid: boolean, error: string | null) => {
        formContext.setFieldError(fieldName, error);
    }, [formContext]);

    const handleCurrencyValidation = useCallback((fieldName: string, _isValid: boolean, error: string | null) => {
        formContext.setFieldError(fieldName, error);
    }, [formContext]);

    // Initialize basket assets when investment type is 'Basket' and no assets exist
    useEffect(() => {
        if (isBasketInvestment && basketAssets.length === 0) {
            const initialAsset = {
                id: 'new' + Date.now(),
                assetname: '',
                assetvalue: 0,
                valuetype: FIELD_TYPES.PERCENTAGE,
                caseid: activeCaseId
            };
            dispatch(addBasketAsset(initialAsset));
        }
    }, [isBasketInvestment, basketAssets.length, activeCaseId, dispatch]);

    // Don't render if not basket investment - AFTER all hooks
    if (!isBasketInvestment) {
        return null;
    }

    const renderAssetValueInput = (asset: { id?: string; assetvalue: number | null; valuetype: FieldType | string }, index: number) => {
        const fieldName = `asset_value_${asset.id ?? index}`;

        if (isPercentageType(asset.valuetype as FieldType)) {
            return (
                <PercentageInput
                    min={0}
                    max={100}
                    value={asset.assetvalue}
                    onChange={(value) => handleUpdateBasketAsset(index, 'assetvalue', value)}
                    onBlur={(value) => formContext.handleBlur(fieldName, value)}
                    onValidationChange={(isValid, error) => handlePercentageValidation(fieldName, isValid, error)}
                    style={getFieldErrorStyle(formContext.errorStates[fieldName])}
                    placeholder="0.00%"
                    disabled={formContext.disabled}
                    name={`assetValue_${asset.id}_${asset.valuetype}`}
                />
            );
        } else {
            return (
                <FormattedCurrencyInput
                    min={0}
                    showSymbol={false}
                    value={asset.assetvalue}
                    onChange={(value) => handleUpdateBasketAsset(index, 'assetvalue', value)}
                    onBlur={(value) => formContext.handleBlur(fieldName, value)}
                    onValidationChange={(isValid, error) => handleCurrencyValidation(fieldName, isValid, error)}
                    style={getFieldErrorStyle(formContext.errorStates[fieldName])}
                    placeholder="0.00"
                    disabled={formContext.disabled}
                    name={`assetValue_${asset.id}_${asset.valuetype}`}
                />
            );
        }
    };

    const renderAssetValueTypeToggle = (asset: { id?: string; valuetype: FieldType | string }, index: number) => {
        const options = [
            { value: FIELD_TYPES.PERCENTAGE, label: <FaPercentage /> },
            { value: FIELD_TYPES.AMOUNT, label: <FaMoneyBillAlt /> }
        ];
        const currentType = getFieldType(asset.valuetype);

        return (
            <PillSwitch
                options={options}
                value={currentType}
                onChange={(value) => handleAssetValueTypeChange(index, value as FieldType)}
                name={`asset-type-${asset.id}`}
                size='sm'
                disabled={formContext.disabled}
            />
        );
    };

    return (
        <Row className="mb-4">
            <Col sm={12}>
                <KanbanContainer>
                    <StyledCardHeader>
                        <span>Basket Assets</span>
                    </StyledCardHeader>
                    <StyledCardBody>
                        {basketAssets.map((asset, index) => (
                            <Row key={asset.id} className={`align-items-end ${index > 0 ? "mt-3" : ""}`}>
                                <Col xs={12} sm={5} md={4}>
                                    <FormGroup controlId={`assetName_${asset.id}`}>
                                        <FormLabel>Asset Name</FormLabel>
                                        <InputWrapper
                                            isLoading={formContext.loadingStates[`asset_name_${asset.id}`]}
                                            rightIcon={renderWarningMessage(formContext.errorStates[`asset_name_${asset.id}`])}
                                        >
                                            <StyledFormControl
                                                value={asset.assetname}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateBasketAsset(index, 'assetname', e.target.value)}
                                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => formContext.handleBlur(`asset_name_${asset.id}`, e.target.value)}
                                                placeholder="Enter asset name"
                                                style={getFieldErrorStyle(formContext.errorStates[`asset_name_${asset.id}`])}
                                                disabled={formContext.disabled}
                                            />
                                        </InputWrapper>
                                    </FormGroup>
                                </Col>
                                <Col xs={12} sm={5} md={4}>
                                    <FormGroup controlId={`assetValue_${asset.id}`}>
                                        <FormLabel className="d-flex align-items-center gap-2">
                                            Asset Value
                                            {renderAssetValueTypeToggle(asset as { id?: string; valuetype: FieldType | string }, index)}
                                        </FormLabel>
                                        <InputWrapper
                                            isLoading={formContext.loadingStates[`asset_value_${asset.id ?? index}`]}
                                            rightIcon={renderWarningMessage(formContext.errorStates[`asset_value_${asset.id ?? index}`])}
                                        >
                                            {renderAssetValueInput(asset as { id?: string; assetvalue: number | null; valuetype: FieldType | string }, index)}
                                        </InputWrapper>
                                    </FormGroup>
                                </Col>
                                <Col xs={12} sm={2} md={4} className="d-flex align-items-end pb-1">
                                    <div className="d-flex gap-2 w-100 justify-content-start">
                                        {basketAssets.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => handleRemoveBasketAsset(index)}
                                                title="Delete asset"
                                                disabled={formContext.disabled}
                                                size="sm"
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                        {index === basketAssets.length - 1 && (
                                            <Button
                                                variant="outline-primary"
                                                onClick={handleAddBasketAsset}
                                                title="Add new asset"
                                                disabled={formContext.disabled}
                                                size="sm"
                                            >
                                                <FaPlus />
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        ))}
                        <StyledFormText className="mt-2">
                            Configure the assets that make up this basket investment. You can switch between percentage and amount values for each asset.
                        </StyledFormText>
                    </StyledCardBody>
                </KanbanContainer>
            </Col>
        </Row>
    );
};

export default BasketAssetsSection;
