import React from 'react';
import { Row, Col, FormGroup, FormLabel, Button, Spinner } from 'react-bootstrap';
import StyledFormText, { StyledFormControl, StyledSelect } from '../../styled/CommonStyled';
import InputWrapper from '../../common/InputWrapper';
import FormattedCurrencyInput from '../../common/FormattedCurrencyInput';
import PercentageInput from '../../common/PercentageInput';
import FormattedISINInput from '../../common/FormattedISINInput';
import { renderWarningMessage } from '../../common/FormValidation';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useCurrencies } from '../../../hooks/useCurrencies';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { CouponTypes } from '../../../types/CouponTypes';

interface ISINEntry {
    id: string;
    isinNumber: string;
    valoren: string;
    issueSize: string;
    currencyid: string | null;
    currency: string | null;
    issuePrice: number;
    interestRate: number;
    couponRate: number;
}

interface ISINsSectionProps {
    isinEntries: ISINEntry[];
    loadingStates: Record<string, boolean>;
    errorStates: Record<string, string>;
    onRemoveISIN: (id: string) => void;
    onISINChange: (id: string, field: keyof ISINEntry, value: string | number) => void;
    onISINBlur: (id: string, field: keyof ISINEntry, value: string | number) => void;
    onValidationChange?: (fieldName: string, isValid: boolean, error: string | null) => void;
    disabled?: boolean;
}

const ISINsSection: React.FC<ISINsSectionProps> = ({
    isinEntries,
    loadingStates,
    errorStates,
    onRemoveISIN,
    onISINChange,
    onISINBlur,
    onValidationChange,
    disabled = false
}) => {
    const { currencies, loading: currenciesLoading, error: currenciesError } = useCurrencies();
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const isFixedCouponType = caseData?.copontype?.id === CouponTypes.FIXED;

    return (
        <>
            {isinEntries.length === 0 && (
                <Row className="mb-3">
                    <Col sm={12} className='text-center'>
                        <div>
                            <FaExclamationTriangle size={30} className='mb-2' />
                            <p>
                                Creating your first ISIN will lock the Product Setup for data integrity.
                                <br />
                                <small className="mt-1 d-block">
                                    Once locked, modifications require a support ticket to unlock. Please review all details carefully before proceeding.
                                </small>
                            </p>
                        </div>
                    </Col>
                </Row>
            )}
            <Row className="mb-3">
                {isinEntries.map((entry, index) => (
                <Row key={entry.id}>
                    <Col sm={12}>
                        <Row>
                            <Col sm={11}>
                                <strong>ISIN {index + 1}</strong>
                            </Col>
                            <Col sm={1}>
                                <button 
                                    type="button" 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => onRemoveISIN(entry.id)}
                                    style={{ display: isinEntries.length <= 1 ? 'none' : 'block' }}
                                    disabled={disabled}
                                >
                                    {loadingStates[entry.id] ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <FaTrash size={15} />
                                    )}
                                </button>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <hr/>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={4}>
                        <FormGroup controlId={`isinNumber-${entry.id}`}>
                            <FormLabel>ISIN Number</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`isinNumber-${entry.id}`]}
                                rightIcon={renderWarningMessage(errorStates[`isinNumber-${entry.id}`])}
                            >
                                <FormattedISINInput
                                    required
                                    value={entry.isinNumber || null}
                                    onChange={(value) => onISINChange(entry.id, 'isinNumber', value || '')}
                                    onBlur={(value) => onISINBlur(entry.id, 'isinNumber', value || '')}
                                    onValidationChange={(isValid, error) => {
                                        if (onValidationChange) {
                                            onValidationChange(`isinNumber-${entry.id}`, isValid, error);
                                        }
                                    }}
                                    autoComplete={true}
                                    disabled={disabled}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </Col>
                    <Col sm={4}>
                        <FormGroup controlId={`valoren-${entry.id}`}>
                            <FormLabel>Valoren</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`valoren-${entry.id}`]}
                                rightIcon={renderWarningMessage(errorStates[`valoren-${entry.id}`])}
                            >
                                <StyledFormControl 
                                    required
                                    minLength={10}
                                    value={entry.valoren}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        onISINChange(entry.id, 'valoren', value);
                                        
                                        // Validate length and update error state
                                        if (onValidationChange) {
                                            if (value.length > 9) {
                                                onValidationChange(`valoren-${entry.id}`, false, 'Valoren should not be more than 9 characters.');
                                            } else {
                                                onValidationChange(`valoren-${entry.id}`, true, null);
                                            }
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        if (value.length >= 0 && value.length <= 9) {
                                            onISINBlur(entry.id, 'valoren', value);
                                        }
                                    }}
                                    placeholder="Enter Valoren"
                                    disabled={disabled}
                                />
                            </InputWrapper>
                            <StyledFormText>Valoren should not be more than 9 characters.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col sm={4}>
                            <FormGroup controlId={`issueSize-${entry.id}`}>
                                <FormLabel>Issue Size</FormLabel>
                                <InputWrapper 
                                    isLoading={loadingStates[`issueSize-${entry.id}`]}
                                    rightIcon={renderWarningMessage(errorStates[`issueSize-${entry.id}`])}
                                >
                                    <StyledFormControl 
                                        type="number"
                                        required
                                        min={0}
                                        value={entry.issueSize || ''}
                                        onChange={(e) => onISINChange(entry.id, 'issueSize', e.target.value)}
                                        onBlur={(e) => onISINBlur(entry.id, 'issueSize', e.target.value)}
                                        placeholder="Enter Issue Size"
                                        disabled={disabled}
                                    />
                                </InputWrapper>
                                <StyledFormText>Target/Expected Issuance Notional</StyledFormText>
                            </FormGroup>
                        </Col>
                    <Col sm={3} className="mt-3">
                        <FormGroup controlId={`currencyid-${entry.id}`}>
                            <FormLabel>Currency</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`currencyid-${entry.id}`] || currenciesLoading}
                                rightIcon={renderWarningMessage(errorStates[`currencyid-${entry.id}`] || (currenciesError ? 'Error loading currencies' : ''))}
                            >
                                <StyledSelect
                                    value={entry.currencyid || ''}
                                    onChange={(e) => onISINChange(entry.id, 'currencyid', e.target.value)}
                                    onBlur={(e) => onISINBlur(entry.id, 'currencyid', e.target.value)}
                                    disabled={currenciesLoading || disabled}
                                >
                                    <option value="">Select Currency</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.currencyshortname} value={currency.id}>
                                            {currency.currencyshortname} - {currency.currencyname}
                                        </option>
                                    ))}
                                </StyledSelect>
                            </InputWrapper>
                        </FormGroup>
                    </Col>
                    <Col sm={3} className="mt-3">
                        <FormGroup controlId={`interestRate-${entry.id}`}>
                            <FormLabel>Interest Rate (%)</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`interestRate-${entry.id}`]}
                                rightIcon={renderWarningMessage(errorStates[`interestRate-${entry.id}`])}
                            >
                                <PercentageInput
                                    required
                                    min={0}
                                    max={100}
                                    value={entry.interestRate || null}
                                    onChange={(value) => onISINChange(entry.id, 'interestRate', value || 0)}
                                    onBlur={(value) => {
                                        onISINBlur(entry.id, 'interestRate', value || 0);
                                    }}
                                    onValidationChange={(isValid, error) => {
                                        if (onValidationChange) {
                                            onValidationChange(`interestRate-${entry.id}`, isValid, error);
                                        }
                                    }}
                                    disabled={disabled}
                                />
                            </InputWrapper>
                            <StyledFormText>{isFixedCouponType ? 'Fixed' : 'Initial floating'} interest rate for this ISIN</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col sm={4} className="mt-3">
                        <FormGroup controlId={`couponRate-${entry.id}`}>
                            <FormLabel>Coupon Rate (%)</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`couponRate-${entry.id}`]}
                                rightIcon={renderWarningMessage(errorStates[`couponRate-${entry.id}`])}
                            >
                                <PercentageInput
                                    required
                                    min={0}
                                    max={100}
                                    value={entry.couponRate || null}
                                    onChange={(value) => onISINChange(entry.id, 'couponRate', value || 0)}
                                    onBlur={(value) => {
                                        onISINBlur(entry.id, 'couponRate', value || 0);
                                    }}
                                    onValidationChange={(isValid, error) => {
                                        if (onValidationChange) {
                                            onValidationChange(`couponRate-${entry.id}`, isValid, error);
                                        }
                                    }}
                                    disabled={disabled}
                                />
                            </InputWrapper>
                            <StyledFormText>{isFixedCouponType ? 'Fixed' : 'Initial floating'} coupon rate for this ISIN</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col sm={4} className="mt-3">
                        <FormGroup controlId={`issuePrice-${entry.id}`}>
                            <FormLabel>Issue Price</FormLabel>
                            <InputWrapper 
                                isLoading={loadingStates[`issuePrice-${entry.id}`]}
                                rightIcon={renderWarningMessage(errorStates[`issuePrice-${entry.id}`])}
                            >
                                <FormattedCurrencyInput
                                    required
                                    min={0}
                                    value={entry.issuePrice || null}
                                    onChange={(value) => onISINChange(entry.id, 'issuePrice', value || 0)}
                                    onBlur={(value) => onISINBlur(entry.id, 'issuePrice', value || 0)}
                                    onValidationChange={(isValid, error) => {
                                        if (onValidationChange) {
                                            onValidationChange(`issuePrice-${entry.id}`, isValid, error);
                                        }
                                    }}
                                    currency={currencies.find(x=>x.id === entry.currency)?.currencyshortname || 'USD'}
                                    showSymbol={true}
                                    disabled={disabled}
                                />
                            </InputWrapper>
                        </FormGroup>
                    </Col>
                    <Col sm={12}>
                        <hr />
                    </Col>
                </Row>
            ))}
            </Row>
        </>
    );
};

export default ISINsSection;
export type { ISINEntry };
