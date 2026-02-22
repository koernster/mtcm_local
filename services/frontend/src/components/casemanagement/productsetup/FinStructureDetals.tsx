import React from 'react';
import { Container, Row, Col, Accordion } from 'react-bootstrap';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import StyledFormText, { StyledButton } from '../../styled/CommonStyled';
import SkeletonLoading from '../../common/SkeletonLoader';
import { useSaveOnBlur } from '../../../hooks/useSaveOnBlur';
import toast from 'react-hot-toast';
import { useCaseStatus } from '../../../hooks/useCaseStatus';
import { useCaseSetup } from '../../../hooks/useCaseSetup';
import { useNavigate } from 'react-router-dom';

// Dynamic Form imports
import { DynamicFormRenderer } from '../../dynamicForm';
import { useProductProfile } from '../../../hooks/useProductProfile';

const FinStructureDetails: React.FC = () => {
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const { isCaseFreezed } = useCaseStatus();
    const { activeCaseId, isinEntries, isinsError } = useCaseSetup();
    const navigate = useNavigate();

    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = React.useState<Record<string, string>>({});

    // Get product type ID for dynamic profile loading
    const productTypeId = caseData?.producttype?.id || caseData?.prodtypeid;

    // Dynamic form hooks
    const { getTabConfig, loading: profileLoading } = useProductProfile(productTypeId);
    const tabConfig = getTabConfig('fin-structure');

    // Check if we have a dynamic profile
    const hasDynamicProfile = !!tabConfig && tabConfig.sections.length > 0;

    // Handle ISIN errors
    React.useEffect(() => {
        if (isinsError) {
            toast.error('Cannot Load ISINs: ' + isinsError);
        }
    }, [isinsError]);

    const setFieldLoading = (field: string, isLoading: boolean) => {
        setLoadingStates(prev => ({ ...prev, [field]: isLoading }));
    };

    const setFieldError = (field: string, error: string | null) => {
        setErrorStates(prev => ({ ...prev, [field]: error || '' }));
    };

    const { readyForSubscription } = useSaveOnBlur({
        activeCaseId,
        setFieldLoading,
        setFieldError
    });

    const handleReadyForSubscription = async () => {
        if (!activeCaseId) return;

        await readyForSubscription();

        if (!errorStates['readyForSubscription']) {
            toast.success('Case is ready for subscription.');
            setTimeout(() => {
                navigate(`/case-management/${activeCaseId}/subscriptions`);
            }, 100);
        } else {
            toast.error(errorStates['readyForSubscription']);
        }
    };

    const handleAddISIN = async () => {
        if (!activeCaseId) return;
        setLoadingISINState(true);
        try {
            //validate coupon type before creating isin.
            if (!caseData?.copontype?.id) {
                toast.error('Please select a coupon type before adding ISINs.');
                return;
            }

            const couponTypeId = caseData.copontype.id;

            // Create a new ISIN entry with default values
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

            // Use the hook's createISIN method with ISINEntry and couponType
            await createISIN(newEntry, couponTypeId);
        } catch (error) {
            console.error('Failed to create new ISIN:', error);
            toast.error('Failed to create new ISIN.');
        } finally {
            setLoadingISINState(false); 
        }
    };

    const handleRemoveISIN = async (id: string) => {
        if (isinEntries.length <= 1) {
            // Don't allow removing the last ISIN
            return;
        }

        try {
            setFieldLoading(id, true);
            await deleteISIN(id);
        } catch (error) {
            console.error('Failed to delete ISIN:', error);
        }finally{
            setFieldLoading(id, false);
        }
    };

    const handleISINChange = (id: string, field: keyof ISINEntry, value: string | number) => {
        // Update local state immediately for better UX (onChange - Redux only)
        dispatch(updateLocalIsinEntry({ id, field, value }));
    };

    const handleISINBlur = (id: string, field: keyof ISINEntry, value: string | number) => {
       // Use the saveOnBlur hook to handle the database update (onBlur - database save)
        const fieldName = `${field}-${id}`;
        handleBlur(fieldName, value);
    };

    const renderSkeletonAccordion = () => (
        <Accordion flush>
            {[...Array(3)].map((_, index) => (
                <SkeletonLoading key={index} rows={1} height={[40]} />
            ))}
        </Accordion>
    );

    return (
        <Container>
            {/* Show skeleton while profile is loading */}
            {profileLoading && (
                <Row className="mb-4">
                    <Col sm={12}>
                        <SkeletonLoading rows={3} height={[80, 60, 60]} />
                    </Col>
                </Row>
            )}

            {/* Render dynamic fields when profile is loaded - including ISINsSection */}
            {!profileLoading && hasDynamicProfile && (
                <DynamicFormRenderer tabConfig={tabConfig} loading={false} />
            )}

            {/* Ready for Subscription Button */}
            <Row className="mt-4">
                <Col sm={12} className="d-flex justify-content-end">
                    <StyledButton
                        variant="success"
                        onClick={handleReadyForSubscription}
                        disabled={isCaseFreezed || isinEntries.length === 0}
                    >
                        <FaThumbsUp className="me-2" />
                        Ready for Subscription
                    </StyledButton>
                </Col>
            </Row>
        </Container>
    );
};

export default FinStructureDetails;

