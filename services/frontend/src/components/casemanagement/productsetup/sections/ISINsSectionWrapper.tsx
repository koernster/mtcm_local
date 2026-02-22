/**
 * ISINsSectionWrapper Component
 * 
 * Wrapper for ISINsSection to work with the dynamic form system.
 * Provides all the ISIN management logic (add, remove, change, blur).
 */
import React from 'react';
import { Row, Button, Spinner } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { ISINEntry, updateLocalIsinEntry } from '../../../../store/slices/caseIsinsSlice';
import { KanbanContainer, StyledCardHeader, StyledCardBody } from '../../../styled/CommonStyled';
import ISINsSection from '../ISINsSection';
import SkeletonLoading from '../../../common/SkeletonLoader';
import { useSaveOnBlur } from '../../../../hooks/useSaveOnBlur';
import { generateUUID } from '../../../../lib/generateUUID';
import toast from 'react-hot-toast';
import { useCaseStatus } from '../../../../hooks/useCaseStatus';
import { useCaseSetup } from '../../../../hooks/useCaseSetup';
import type { CustomSectionProps } from '../../../../types/dynamicForm';

const ISINsSectionWrapper: React.FC<CustomSectionProps> = ({ formContext }) => {
    const dispatch = useDispatch();
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const { canEditIsin, isCaseFreezed } = useCaseStatus();
    const {
        activeCaseId,
        isinEntries,
        isinsLoading,
        createISIN,
        deleteISIN
    } = useCaseSetup();

    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = React.useState<Record<string, string>>({});
    const [loadingISINState, setLoadingISINState] = React.useState<boolean>(false);

    const setFieldLoading = (field: string, isLoading: boolean) => {
        setLoadingStates(prev => ({ ...prev, [field]: isLoading }));
    };

    const setFieldError = (field: string, error: string | null) => {
        setErrorStates(prev => ({ ...prev, [field]: error || '' }));
    };

    const { handleBlur } = useSaveOnBlur({
        activeCaseId,
        setFieldLoading,
        setFieldError
    });

    const handleAddISIN = async () => {
        if (!activeCaseId || !caseData?.copontype?.id) {
            toast.error('Please select a coupon type before adding ISINs.');
            return;
        }

        setLoadingISINState(true);
        try {
            const newEntry: ISINEntry = {
                id: generateUUID(),
                isinNumber: '',
                valoren: '',
                issueSize: '',
                currencyid: null,
                currency: process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF',
                issuePrice: 0,
                interestRate: 0,
                couponRate: 0,
            };
            await createISIN(newEntry, caseData.copontype.id);
        } catch (error) {
            toast.error('Failed to create new ISIN.');
        } finally {
            setLoadingISINState(false);
        }
    };

    const handleRemoveISIN = async (id: string) => {
        if (isinEntries.length <= 1) return;
        try {
            setFieldLoading(id, true);
            await deleteISIN(id);
        } finally {
            setFieldLoading(id, false);
        }
    };

    const renderSkeletonAccordion = () => (
        <div>{[...Array(3)].map((_, i) => <SkeletonLoading key={i} rows={1} height={[40]} />)}</div>
    );

    return (
        <Row className="mb-3">
            <KanbanContainer>
                <StyledCardHeader as="h6" className="d-flex justify-content-between align-items-center">
                    ISINs
                    {isinEntries.length < 3 && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleAddISIN}
                            disabled={!canEditIsin || loadingISINState}
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            {loadingISINState ? <Spinner animation="border" size="sm" /> : <FaPlus />}
                        </Button>
                    )}
                </StyledCardHeader>
                <StyledCardBody>
                    {isinsLoading ? renderSkeletonAccordion() : (
                        <ISINsSection
                            isinEntries={isinEntries}
                            loadingStates={loadingStates}
                            errorStates={errorStates}
                            onRemoveISIN={handleRemoveISIN}
                            onISINChange={(id, field, value) => {
                                dispatch(updateLocalIsinEntry({ id, field, value }));
                            }}
                            onISINBlur={(id, field, value) => {
                                handleBlur(`${field}-${id}`, value);
                            }}
                            disabled={isCaseFreezed}
                        />
                    )}
                </StyledCardBody>
            </KanbanContainer>
        </Row>
    );
};

export default ISINsSectionWrapper;
