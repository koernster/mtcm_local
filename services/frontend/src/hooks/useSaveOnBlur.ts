import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCaseData } from '../store/slices/caseSetupSlice';
import { ISINEntry, updateCaseIsin, updateLocalIsinEntry } from '../store/slices/caseIsinsSlice';
import CaseService from '../services/api/graphQL/cases/service';
import { RootState } from '../store/store';
import { FIELD_TYPES } from '../types/common/fieldTypes';
//import { couponPaymentDates } from '../utils/buySellCalculations';
import { CompartmentStatus } from '../types/CompartmentStatus';
import { setupEvents } from '../utils/eventSetup';
import { EventService } from '../services/api/graphQL/events';
//import { AsyncThunkAction } from '@reduxjs/toolkit';
//import { CaseIsin } from '../services/api/graphQL/cases';

interface SaveOnBlurConfig {
    activeCaseId: string | null;
    setFieldLoading: (field: string, isLoading: boolean) => void;
    setFieldError: (field: string, error: string | null) => void;
    onSuccess?: (field: string, value: any) => void;
    onError?: (field: string, error: Error) => void;
}

const isValidValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'boolean') return true; // Allow boolean values for switches
    return true;
};

// Helper function to detect if field is an ISIN field
const isIsinField = (field: string): boolean => {
    return field.includes('isin-') ||
        ['isinNumber', 'valoren', 'issueSize', 'currency', 'issuePrice', 'interestRate', 'couponRate'].some(isinField =>
            field.includes(isinField)
        );
};

// Helper function to detect if field is a fee field
const isFeeField = (field: string): boolean => {
    const feeFields = ['setupfee', 'setupfeetype', 'adminfee', 'adminfeetype', 'managementfee', 'managementfeetype',
        'salesfee', 'salesfeetype', 'performancefee', 'performancefeetype', 'otherfees', 'otherfeestype'];
    return feeFields.includes(field);
};

// Helper function to detect if field is a cost field
const isCostField = (field: string): boolean => {
    const costFields = ['operationalcosts', 'runningcosts', 'payingagentcosts', 'auditcosts', 'legalcosts',
        'operationalcosttype', 'runningcosttype', 'payingagentcosttype', 'auditcosttype', 'legalcosttype'];
    return costFields.includes(field);
};

// Helper function to detect if field is a subscription data field
const isSubscriptionField = (field: string): boolean => {
    const subscriptionFields = ['distributionpaidbyinvs', 'salesfeepaidbyinves', 'salesnotpaidissuedate', 'salesnotpaidmaturitydate'];
    return subscriptionFields.includes(field);
};

// Helper function to detect if field is a basket asset field
const isBasketAssetField = (field: string): boolean => {
    return field.includes('asset_name_') || field.includes('asset_value_') || field.includes('value_type_');
};

// Helper function to parse basket asset field information
const parseBasketAssetField = (field: string): { assetId: string; fieldName: string } | null => {
    // Expected format: "asset_name_123" or "asset_value_123"
    if (field.includes('asset_name_')) {
        const assetId = field.replace('asset_name_', '');
        return { assetId, fieldName: 'assetname' };
    } else if (field.includes('asset_value_')) {
        const assetId = field.replace('asset_value_', '');
        return { assetId, fieldName: 'assetvalue' };
    }
    else if (field.includes('value_type_')) {
        const assetId = field.replace('value_type_', '');
        return { assetId, fieldName: 'valuetype' };
    }
    return null;
};

// Helper function to parse ISIN field information
const parseIsinField = (field: string): { isinId: string; fieldName: string } | null => {
    // Expected format: "fieldName-isinId" (e.g., "isinNumber-123", "valoren-456")
    const parts = field.split('-');
    if (parts.length >= 2) {
        const fieldName = parts[0];
        const isinId = parts.slice(1).join('-'); // In case the ID contains hyphens
        return { isinId, fieldName };
    }
    return null;
};

export const useSaveOnBlur = ({
    activeCaseId,
    setFieldLoading,
    setFieldError,
    onSuccess,
    onError
}: SaveOnBlurConfig) => {
    const dispatch = useDispatch();
    const currentCaseData = useSelector((state: RootState) => state.caseSetup.caseData);

    // Use a ref to always have access to the latest basket assets
    // This avoids stale closure issues when onChange and onBlur are called together
    const basketAssetsRef = useRef(currentCaseData?.case_assetbaskets);
    basketAssetsRef.current = currentCaseData?.case_assetbaskets;

    // Helper to dispatch setCaseData while preserving unsaved basket assets
    const dispatchWithPreservedBasketAssets = useCallback((updatedCase: any) => {
        // Use ref to get fresh basket assets instead of stale closure value
        const currentBasketAssets = basketAssetsRef.current || [];
        const unsavedBasketAssets = currentBasketAssets
            .filter((asset: any) => asset.id?.toString().startsWith('new'));

        if (unsavedBasketAssets.length > 0) {
            const backendAssets = updatedCase.case_assetbaskets || [];
            // Create a new object instead of mutating to avoid Redux frozen object error
            const mergedCase = {
                ...updatedCase,
                case_assetbaskets: [...backendAssets, ...unsavedBasketAssets]
            };
            dispatch(setCaseData(mergedCase));
        } else {
            dispatch(setCaseData(updatedCase));
        }
    }, [dispatch]);

    // Handle blur event for form fields to save it on database.
    const handleBlur = useCallback(async (field: string, value: any) => {
        if (!activeCaseId) return;

        // Skip if the value is not valid (null, empty string, or just whitespace)
        if (!isValidValue(value)) {
            setFieldError(field, 'Value cannot be empty');
            return;
        }

        setFieldLoading(field, true);
        setFieldError(field, null);

        try {
            // Check if this is an ISIN field
            if (isIsinField(field)) {
                const isinFieldInfo = parseIsinField(field);
                if (!isinFieldInfo) {
                    throw new Error('Invalid ISIN field format');
                }

                const { isinId, fieldName } = isinFieldInfo;

                // Use Redux thunk to update the ISIN
                await dispatch(updateCaseIsin({ id: isinId, field: fieldName, value, couponTypeId: currentCaseData?.copontype?.id, issueDate: currentCaseData?.issuedate }) as any);

                // check parsed key is not null fieldName as keyof ISINEntry
                const key = fieldName as keyof ISINEntry;

                if (key) {
                    dispatch(updateLocalIsinEntry({
                        id: isinId,
                        field: key,
                        value: value
                    }));
                }

                onSuccess?.(field, value);
            } else if (isFeeField(field)) {
                // Handle fee fields
                const caseFee = currentCaseData?.casefee;

                if (caseFee?.id) {
                    const updateData: any = {
                        [field]: value
                    };

                    // Reset asset value to zero when value type changes
                    if (field.endsWith('type')) {
                        updateData[field.replace('type', '')] = null;
                    }

                    // Update existing casefee record
                    await CaseService.getInstance().updateCaseFee(caseFee.id, updateData);
                } else {
                    // Create new casefee record
                    await CaseService.getInstance().insertCaseFee({
                        caseid: activeCaseId,
                        [field]: value
                    });
                }

                // Refresh case data to get updated fee information
                const updatedCase = await CaseService.getInstance().getCaseById(activeCaseId);
                dispatchWithPreservedBasketAssets(updatedCase);
                onSuccess?.(field, value);
            } else if (isCostField(field)) {
                // Handle cost fields
                const caseCost = currentCaseData?.casecost;

                if (caseCost?.id) {
                    const updateData: any = {
                        [field]: value
                    };

                    // Reset asset value to zero when value type changes
                    if (field.endsWith('type')) {
                        updateData[field.replace('type', 's')] = null;
                    }

                    // Update existing casecost record
                    await CaseService.getInstance().updateCaseCost(caseCost.id, updateData);
                } else {
                    // Create new casecost record
                    await CaseService.getInstance().insertCaseCost({
                        caseid: activeCaseId,
                        [field]: value
                    });
                }

                // Refresh case data to get updated cost information
                const updatedCase = await CaseService.getInstance().getCaseById(activeCaseId);
                dispatchWithPreservedBasketAssets(updatedCase);
                onSuccess?.(field, value);
            } else if (isSubscriptionField(field)) {
                // Handle subscription data fields
                const caseSubscription = currentCaseData?.casesubscriptiondata;

                if (caseSubscription?.id) {
                    // Update existing casesubscriptiondata record
                    await CaseService.getInstance().updateCaseSubscription(caseSubscription.id, {
                        [field]: value
                    });
                } else {
                    // Create new casesubscriptiondata record
                    await CaseService.getInstance().insertCaseSubscription({
                        caseid: activeCaseId,
                        [field]: value
                    });
                }

                // Refresh case data to get updated subscription information
                const updatedCase = await CaseService.getInstance().getCaseById(activeCaseId);
                dispatchWithPreservedBasketAssets(updatedCase);
                onSuccess?.(field, value);
            } else if (isBasketAssetField(field)) {
                // Handle basket asset fields
                const basketAssetInfo = parseBasketAssetField(field);
                if (!basketAssetInfo) {
                    throw new Error('Invalid basket asset field format');
                }

                const { assetId, fieldName } = basketAssetInfo;

                // Find the asset in current case data
                const currentAssets = currentCaseData?.case_assetbaskets || [];
                const existingAsset = currentAssets.find(asset => asset.id?.toString() === assetId);

                if (existingAsset && existingAsset.id && typeof existingAsset.id === 'string' && !existingAsset.id.startsWith('new')) {
                    // Update existing asset
                    const updateData: any = {
                        [fieldName]: value
                    };

                    // Reset asset value to zero when value type changes
                    if (fieldName === 'valuetype') {
                        updateData.assetvalue = null;
                    }

                    await CaseService.getInstance().updateBasketAsset(existingAsset.id, updateData);
                } else {
                    // Create new asset - this shouldn't happen in normal flow but handle it
                    await CaseService.getInstance().insertBasketAsset({
                        caseid: activeCaseId,
                        assetname: fieldName === 'assetname' ? value : '',
                        assetvalue: fieldName === 'assetvalue' ? value : 0,
                        valuetype: fieldName === 'valuetype' ? value : FIELD_TYPES.PERCENTAGE
                    });
                }

                // Refresh case data to get updated basket asset information
                const updatedCase = await CaseService.getInstance().getCaseById(activeCaseId);
                dispatchWithPreservedBasketAssets(updatedCase);
                onSuccess?.(field, value);
            } else {
                // Handle regular case data fields
                // Skip client field as it's handled separately with HubSpot integration
                if (field === 'client') return;

                // Convert field to proper case data key
                const dataKey = field.toLowerCase();

                // Save to backend and get updated case data
                const updatedCase = await CaseService.getInstance().updateCase(activeCaseId, {
                    [dataKey]: value
                });

                // Update Redux store with backend data, preserving unsaved basket assets
                dispatchWithPreservedBasketAssets(updatedCase);
                onSuccess?.(field, value);
            }
        } catch (error) {
            // If save fails, handle the error appropriately
            let errorMessage: string;

            if (isIsinField(field)) {
                errorMessage = `Failed to save ISIN ${field}. Please try again.`;
            } else if (isFeeField(field)) {
                errorMessage = `Failed to save fee ${field}. Please try again.`;
            } else if (isCostField(field)) {
                errorMessage = `Failed to save cost ${field}. Please try again.`;
            } else if (isSubscriptionField(field)) {
                errorMessage = `Failed to save subscription ${field}. Please try again.`;
            } else {
                errorMessage = `Failed to save ${field}. Please try again.`;
            }

            setFieldError(field, errorMessage);

            // For case data, fee, and cost fields, try to fetch the latest case data to ensure UI is in sync with backend
            if (!isIsinField(field)) {
                try {
                    const latestCase = await CaseService.getInstance().getCaseById(activeCaseId);
                    dispatchWithPreservedBasketAssets(latestCase);
                } catch (fetchError) {
                    console.error('Failed to fetch latest case data:', fetchError);
                }
            }

            onError?.(field, error instanceof Error ? error : new Error(errorMessage));
        } finally {
            setFieldLoading(field, false);
        }
    }, [activeCaseId, dispatch, setFieldLoading, setFieldError, onSuccess, onError, currentCaseData, dispatchWithPreservedBasketAssets]);

    // Mark this case ready for subscription along with background setup.
    const readyForSubscription = useCallback(async () => {
        if (!activeCaseId)
            return;

        setFieldLoading('readyForSubscription', true);
        setFieldError('readyForSubscription', null);

        try {
            const freq = currentCaseData?.coponfrequency;
            const iDate = currentCaseData?.issuedate ? new Date(currentCaseData.issuedate) : null;
            const mDate = currentCaseData?.maturitydate ? new Date(currentCaseData.maturitydate) : null;

            if (iDate && mDate && freq) {
                // calculate coupon payment dates
                const events = setupEvents(activeCaseId, iDate, mDate, freq.frequency);
                await EventService.getInstance().createEventTransactionsBatch(events);

                //save compartmentstatusid to subscription = 9.
                const field = 'compartmentstatusid';
                const status = CompartmentStatus.SUBSCRIPTION;
                const updatedCase = await CaseService.getInstance().updateCase(activeCaseId, {
                    [field]: status
                });

                // Update entire Redux store with latest backend data
                await dispatch(setCaseData(updatedCase));
                onSuccess?.(field, status);
            } else {
                //we might through error or something here later;
                setFieldError('readyForSubscription', 'Missing required data: issue date, maturity date, or coupon frequency');
                return;
            }
        } catch (error) {
            const errorMessage = 'Failed to prepare case for subscription. Please try again.';
            setFieldError('readyForSubscription', errorMessage);
            onError?.(
                'readyForSubscription',
                error instanceof Error ? error : new Error(errorMessage)
            );
        } finally {
            setFieldLoading('readyForSubscription', false);
        }
    }, [activeCaseId, dispatch, setFieldLoading, setFieldError, onSuccess, onError, currentCaseData]);

    return { handleBlur, readyForSubscription };
};
