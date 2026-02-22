/**
 * SubscriptionCostsSection Component
 * 
 * Renders subscription-related cost fields including boolean toggles and percentages.
 * Used as a custom section in dynamic form configuration.
 */
import React, { useCallback } from 'react';
import { Row, Col, FormGroup, FormLabel } from 'react-bootstrap';
import StyledFormText, { KanbanContainer, StyledCardHeader, StyledCardBody } from '../../../styled/CommonStyled';
import InputWrapper from '../../../common/InputWrapper';
import PercentageInput from '../../../common/PercentageInput';
import PillSwitch from '../../../common/PillSwitch';
import { getFieldErrorStyle, renderWarningMessage } from '../../../common/FormValidation';
import type { CustomSectionProps } from '../../../../types/dynamicForm';

const SubscriptionCostsSection: React.FC<CustomSectionProps> = ({ formContext }) => {
    const { caseData, disabled, loadingStates, errorStates, dispatch, handleBlur } = formContext;
    const { updateCaseData } = require('../../../../store/slices/caseSetupSlice');

    const subscriptionData = (caseData as any)?.casesubscriptiondata || {};

    const handleBooleanChange = useCallback((field: string, value: string) => {
        const boolValue = value === 'yes';
        (dispatch as Function)(updateCaseData({
            casesubscriptiondata: { ...subscriptionData, [field]: boolValue }
        }));
        handleBlur(field, boolValue);
    }, [subscriptionData, dispatch, handleBlur, updateCaseData]);

    const handlePercentageChange = useCallback((field: string, value: number | null) => {
        (dispatch as Function)(updateCaseData({
            casesubscriptiondata: { ...subscriptionData, [field]: value || undefined }
        }));
    }, [subscriptionData, dispatch, updateCaseData]);

    return (
        <Row>
            <KanbanContainer>
                <StyledCardHeader as="h6">Subscription Costs</StyledCardHeader>
                <StyledCardBody>
                    <Row>
                        <Col sm={6}>
                            <FormGroup controlId="distributionPaidByInvestor">
                                <FormLabel>Distribution paid by Investor</FormLabel>
                                <PillSwitch
                                    options={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' }
                                    ]}
                                    value={subscriptionData.distributionpaidbyinvs ? 'yes' : 'no'}
                                    onChange={(value: string) => handleBooleanChange('distributionpaidbyinvs', value)}
                                    disabled={disabled}
                                    isLoading={loadingStates['distributionpaidbyinvs']}
                                    name="distributionPaidByInvestor"
                                    size="sm"
                                />
                                {renderWarningMessage(errorStates['distributionpaidbyinvs'])}
                                <StyledFormText>Whether distribution is paid by the investor</StyledFormText>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col sm={4}>
                            <FormGroup controlId="salesFeePaidByInvestor">
                                <FormLabel>Sales Fee paid by Investor</FormLabel>
                                <PillSwitch
                                    options={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' }
                                    ]}
                                    value={subscriptionData.salesfeepaidbyinves ? 'yes' : 'no'}
                                    onChange={(value: string) => handleBooleanChange('salesfeepaidbyinves', value)}
                                    disabled={disabled}
                                    isLoading={loadingStates['salesfeepaidbyinves']}
                                    name="salesFeePaidByInvestor"
                                    size="sm"
                                />
                                {renderWarningMessage(errorStates['salesfeepaidbyinves'])}
                                <StyledFormText>Whether sales fee is paid by the investor</StyledFormText>
                            </FormGroup>
                        </Col>
                        <Col sm={4}>
                            <FormGroup controlId="salesNotPaidIssueDate">
                                <FormLabel>On Issue date (%)</FormLabel>
                                <InputWrapper
                                    isLoading={loadingStates['salesnotpaidissuedate']}
                                    rightIcon={renderWarningMessage(errorStates['salesnotpaidissuedate'])}
                                >
                                    <PercentageInput
                                        min={0}
                                        max={100}
                                        value={subscriptionData.salesnotpaidissuedate || null}
                                        onChange={(value: number | null) => handlePercentageChange('salesnotpaidissuedate', value)}
                                        onBlur={(value: number | null) => handleBlur('salesnotpaidissuedate', value)}
                                        style={getFieldErrorStyle(errorStates['salesnotpaidissuedate'])}
                                        disabled={disabled || subscriptionData.salesfeepaidbyinves}
                                    />
                                </InputWrapper>
                                <StyledFormText>Fee Paid by client (0-100%)</StyledFormText>
                            </FormGroup>
                        </Col>
                        <Col sm={4}>
                            <FormGroup controlId="salesNotPaidMaturityDate">
                                <FormLabel>On Maturity date (%)</FormLabel>
                                <InputWrapper
                                    isLoading={loadingStates['salesnotpaidmaturitydate']}
                                    rightIcon={renderWarningMessage(errorStates['salesnotpaidmaturitydate'])}
                                >
                                    <PercentageInput
                                        min={0}
                                        max={100}
                                        value={subscriptionData.salesnotpaidmaturitydate || null}
                                        onChange={(value: number | null) => handlePercentageChange('salesnotpaidmaturitydate', value)}
                                        onBlur={(value: number | null) => handleBlur('salesnotpaidmaturitydate', value)}
                                        style={getFieldErrorStyle(errorStates['salesnotpaidmaturitydate'])}
                                        disabled={disabled || subscriptionData.salesfeepaidbyinves}
                                    />
                                </InputWrapper>
                                <StyledFormText>Fee paid by client (0-100%)</StyledFormText>
                            </FormGroup>
                        </Col>
                    </Row>
                </StyledCardBody>
            </KanbanContainer>
        </Row>
    );
};

export default SubscriptionCostsSection;
