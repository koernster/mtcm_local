import React, { useMemo, useCallback, useState } from 'react';
import { Form, Container, Row, Col, FormGroup, FormLabel, InputGroup, Button } from 'react-bootstrap';
import {  FaPlus, FaTrash, FaPen } from 'react-icons/fa6';
import { FaPercentage, FaMoneyBillAlt, FaBuilding } from 'react-icons/fa';
import StyledFormText, { StyledButton, StyledFormControl, StyledSelect, KanbanContainer, StyledCardHeader, StyledCardBody } from '../../styled/CommonStyled';
import { useProductSetupData } from '../../../hooks/useProductSetupData';
import { Autocomplete } from '../../common/Autocomplete';
import { searchContacts } from '../../../services/api/hubspot';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { updateCaseData } from '../../../store/slices/caseSetupSlice';
import type { HubSpotContact } from '../../../services/api/hubspot/types';
import { useCompanyAndCaseManager } from '../../../hooks/useCompanyAndCaseManager';
import CompanyService from '../../../services/api/graphQL/company/service';
import InputWrapper from '../../common/InputWrapper';
import PercentageInput from '../../common/PercentageInput';
import FormattedCurrencyInput from '../../common/FormattedCurrencyInput';
import PillSwitch from '../../common/PillSwitch';
import AddressModal from '../../common/AddressModal';
import { renderWarningMessage, getFieldErrorStyle } from '../../common/FormValidation';
import { useSaveOnBlur } from '../../../hooks/useSaveOnBlur';
import CaseService from '../../../services/api/graphQL/cases/service';
import { useCaseStatus } from '../../../hooks/useCaseStatus';
import { useAuth } from '../../../context/AuthContext';
import { useProductProfile } from '../../../hooks/useProductProfile';
import { useFormContext } from '../../../hooks/useFormContext';
import SkeletonLoading from '../../common/SkeletonLoader';
import { DynamicFormRenderer } from '../../dynamicForm';

const BasicProductInfo: React.FC = () => {
    const dispatch = useDispatch();
    const { keycloak } = useAuth();
    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = React.useState<Record<string, string>>({});
    const [showAddressModal, setShowAddressModal] = useState(false);
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const activeCaseId = useSelector((state: RootState) => state.caseSetup.activeCaseId);
    const { isCaseFreezed } = useCaseStatus();

    // Get product type ID for dynamic profile loading
    const productTypeId = caseData?.producttype?.id || caseData?.prodtypeid;

    // Dynamic form hooks
    const { getTabConfig, loading: profileLoading } = useProductProfile(productTypeId);
    const formContext = useFormContext(activeCaseId);
    const tabConfig = getTabConfig('basic-product-info');

    // Check if we have a dynamic profile to use
    const hasDynamicProfile = !!tabConfig && tabConfig.sections.length > 0;

    const setFieldLoading = useCallback((field: string, isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [field]: isLoading
        }));
    }, []);

    const setFieldError = useCallback((field: string, error: string | null) => {
        setErrorStates(prev => ({
            ...prev,
            [field]: error || ''
        }));
    }, []);

    const { handleBlur } = useSaveOnBlur({
        activeCaseId,
        setFieldLoading,
        setFieldError
    });

    // Product setup data for dropdowns (used for fixed fields)
    const {
        productTypes,
        spvs,
        productTypesLoading,
        spvsLoading,
        productTypesError,
        spvsError,
    } = useProductSetupData();

    const { saveClientAndUpdateCase } = useCompanyAndCaseManager();

    const handleClientSelect = useCallback(async (contact: HubSpotContact) => {
        if (activeCaseId) {
            setFieldLoading('client', true);
            setFieldError('client', null);
            try {
                const company = await saveClientAndUpdateCase(contact, activeCaseId);
                dispatch(updateCaseData({ 
                    company: company
                }));
            } catch (error) {
                setFieldError('client', `Failed to save client. Please try again.`);
            } finally {
                setFieldLoading('client', false);
            }
        }
    }, [activeCaseId, setFieldLoading, setFieldError, saveClientAndUpdateCase, dispatch]);

    const handleUnderlyingClientSelect = useCallback(async (company: Company) => {
        if (activeCaseId) {
            setFieldLoading('underlyingClient', true);
            setFieldError('underlyingClient', null);
            try {
                await CaseService.getInstance().updateCase(activeCaseId, {
                    underlyingcompanyid: company.id
                });
                dispatch(updateCaseData({
                    companyByUnderlyingcompanyid: company
                }));
            } catch (error) {
                setFieldError('underlyingClient', `Failed to save underlying client. Please try again.`);
            } finally {
                setFieldLoading('underlyingClient', false);
            }
        }
    }, [activeCaseId, setFieldLoading, setFieldError, dispatch]);

    const handleCreateUnderlyingClient = useCallback(async (companyName: string) => {
        if (activeCaseId) {
            setFieldLoading('underlyingClient', true);
            setFieldError('underlyingClient', null);
            try {
                const newCompany = await CompanyService.getInstance().createUnderlyingClientCompany(companyName);
                await CaseService.getInstance().updateCase(activeCaseId, {
                    underlyingcompanyid: newCompany.id
                });
                dispatch(updateCaseData({
                    companyByUnderlyingcompanyid: newCompany
                }));
            } catch (error) {
                setFieldError('underlyingClient', `Failed to create underlying client. Please try again.`);
            } finally {
                setFieldLoading('underlyingClient', false);
            }
        }
    }, [activeCaseId, setFieldLoading, setFieldError, dispatch]);

    // Render error message when no dynamic profile is found
    const renderProfileError = () => (
        <Row className="mb-4">
            <Col sm={12}>
                <div className="alert alert-danger" role="alert">
                    <strong>Configuration Error:</strong> No product profile configuration found for this product type.
                    Please contact your administrator to set up the product profile.
                </div>
            </Col>
        </Row>
    );

    return (
        <Container>
            <Form>
                {/* ===== FIXED FIELDS ===== */}

                {/* Client Section */}
                <Row className="mb-4">
                    <Col sm={12}>
                        <FormGroup controlId="client">
                            <FormLabel className="d-flex align-items-center gap-2">
                                Client Details
                            </FormLabel>                            
                            <InputGroup className="w-100">
                                <div style={{ flex: 1 }}>
                                    <Autocomplete<HubSpotContact>
                                        value={caseData?.company?.companyname || ''}
                                        onChange={() => { }}
                                        onSelect={handleClientSelect}
                                        onSearch={async (query) => {
                                            setFieldError('client', null); // Clear error when user types
                                            const response = await searchContacts(query, keycloak?.token);
                                            return response.results;
                                        }}
                                        getOptionLabel={(contact: HubSpotContact) => `${contact.properties.firstname} ${contact.properties.lastname}`}
                                        placeholder={"Search clients from HubSpot..."}
                                        minLength={3}
                                        debounceMs={300}
                                        loading={loadingStates['client']}
                                        disabled={!!caseData?.company?.hbid || loadingStates['client'] || isCaseFreezed}
                                        error={!!errorStates['client']}
                                        errorMessage={errorStates['client']}
                                        textElementStyle={
                                            caseData?.company?.id
                                                ? {
                                                    flex: 1,
                                                    borderTopRightRadius: 0,
                                                    borderBottomRightRadius: 0
                                                }
                                                : { flex: 1 }
                                        }
                                    />
                                </div>
                                {caseData?.company?.id && (
                                    <InputGroup.Text 
                                        as={StyledButton}
                                        type="button"
                                        variant="primary"
                                        onClick={(e) => setShowAddressModal(true)}
                                    >
                                        <FaBuilding /> Profile
                                    </InputGroup.Text>
                                )}
                                {/* {caseData?.company?.hbid && (
                                    <InputGroup.Text 
                                        as={StyledButton}
                                        type="button"
                                        variant="primary"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        <FaBuilding />&nbsp; Profile
                                    </InputGroup.Text>
                                )} */}
                            </InputGroup>
                            <StyledFormText>Search by name or email to automatically link a HubSpot contact.</StyledFormText>
                        </FormGroup>
                    </Col>
                </Row>

                {/* Underlying Client Section */}
                <Row className="mb-4">
                    <Col sm={4}>
                        <FormGroup controlId="spv">
                            <FormLabel>SPV</FormLabel>
                            <InputWrapper
                                isLoading={loadingStates['spvid'] || spvsLoading}
                                rightIcon={renderWarningMessage(errorStates['spvid'])}
                            >
                                <StyledSelect
                                    required
                                    value={caseData?.spvid || ''}
                                    onChange={(e) => {
                                        dispatch(updateCaseData({ spvid: e.target.value }));
                                        handleBlur('spvid', e.target.value);
                                    }}
                                    style={getFieldErrorStyle(errorStates['spvid'])}
                                    disabled={spvsLoading || isCaseFreezed}
                                >
                                    <option value="">Select SPV</option>
                                    {!spvsLoading && !spvsError && spvs.map((spv) => (
                                        <option key={spv.id} value={spv.id}>
                                            {spv.spvtitle}
                                        </option>
                                    ))}
                                </StyledSelect>
                            </InputWrapper>
                            <StyledFormText>Choose SPV for the Compartment.</StyledFormText>
                        </FormGroup>
                    </Col>
                    <Col sm={8}>
                        <FormGroup controlId="compartmentName">
                            <FormLabel>Compartment Name (EMTNXX-45)</FormLabel>
                            <InputWrapper
                                isLoading={loadingStates['compartmentname']}
                                rightIcon={renderWarningMessage(errorStates['compartmentname'])}
                            >
                                <StyledFormControl
                                    required
                                    value={caseData?.compartmentname || ''}
                                    onChange={(e) => dispatch(updateCaseData({ compartmentname: e.target.value }))}
                                    onBlur={(e) => handleBlur('compartmentname', e.target.value)}
                                    placeholder="Enter compartment name"
                                    style={getFieldErrorStyle(errorStates['compartmentname'])}
                                    disabled={isCaseFreezed}
                                />
                            </InputWrapper>
                            <StyledFormText>The name of the securitization compartment.</StyledFormText>
                        </FormGroup>
                    </Col>
                </Row>

                {/* Product Type - Triggers profile loading */}
                <Row className="mb-4">
                    <Col sm={6}>
                        <FormGroup controlId="productType">
                            <FormLabel>Product Type</FormLabel>
                            <InputWrapper
                                isLoading={loadingStates['prodtypeid'] || productTypesLoading}
                                rightIcon={renderWarningMessage(errorStates['prodtypeid'])}
                            >
                                <StyledSelect
                                    required
                                    value={caseData?.producttype?.id || ''}
                                    onChange={(e) => {
                                        dispatch(updateCaseData({ prodtypeid: e.target.value }));
                                        handleBlur('prodtypeid', e.target.value);
                                    }}
                                    style={getFieldErrorStyle(errorStates['prodtypeid'])}
                                    disabled={isCaseFreezed}
                                >
                                    <option value="">Select type</option>
                                    {!productTypesLoading && !productTypesError &&
                                        productTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.typename}
                                            </option>
                                        ))
                                    }
                                </StyledSelect>
                            </InputWrapper>
                            <StyledFormText>Select product type to load additional configuration.</StyledFormText>
                        </FormGroup>
                    </Col>
                </Row>

                {/* ===== DYNAMIC FIELDS OR FALLBACK ===== */}

                {/* Show skeleton while profile is loading */}
                {profileLoading && productTypeId && (
                    <Row className="mb-4">
                        <Col sm={12}>
                            <SkeletonLoading rows={4} height={[60, 60, 60, 60]} />
                        </Col>
                    </Row>
                )}

                {/* Render dynamic fields when profile is loaded */}
                {!profileLoading && hasDynamicProfile && (
                    <DynamicFormRenderer tabConfig={tabConfig} loading={false} />
                )}

                {/* Render error when no profile */}
                {!profileLoading && !hasDynamicProfile && productTypeId && renderProfileError()}

                {/* Message when no product type selected */}
                {!productTypeId && (
                    <Row className="mb-4">
                        <Col sm={12}>
                            <StyledFormText className="text-muted text-center">
                                Select a Product Type above to continue configuration.
                            </StyledFormText>
                        </Col>
                    </Row>
                )}
            </Form>

            {/* Address Modal */}
            {caseData?.company?.id && (
                <AddressModal
                    show={showAddressModal}
                    onHide={() => setShowAddressModal(false)}
                    companyId={caseData.company.id}
                    companyName={caseData.company.companyname}
                    initialData={{
                        clienttype: caseData.company.clienttype,
                        addressByAddressid: caseData.company.addressByAddressid
                    }}
                    onUpdate={(updatedData) => {
                        dispatch(updateCaseData({
                            company: {
                                ...caseData.company,
                                ...updatedData
                            }
                        }));
                    }}
                    disabled={isCaseFreezed}
                />
            )}
        </Container>
    );
};

export default BasicProductInfo;
