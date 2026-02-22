import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

// Dynamic Form imports
import { DynamicFormRenderer } from '../../dynamicForm';
import { useProductProfile } from '../../../hooks/useProductProfile';
import { useFormContext } from '../../../hooks/useFormContext';
import StyledFormText from '../../styled/CommonStyled';
import SkeletonLoading from '../../common/SkeletonLoader';

const KeyDateSchedules: React.FC = () => {
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    const activeCaseId = useSelector((state: RootState) => state.caseSetup.activeCaseId);

    // Get product type ID for dynamic profile loading
    const productTypeId = caseData?.producttype?.id || caseData?.prodtypeid;

    // Dynamic form hooks
    const { getTabConfig, loading: profileLoading } = useProductProfile(productTypeId);
    const formContext = useFormContext(activeCaseId);
    const tabConfig = getTabConfig('key-dates');

    // Check if we have a dynamic profile to use
    const hasDynamicProfile = !!tabConfig && tabConfig.sections.length > 0;

    // No product type or no profile - show simple message
    if (!productTypeId || (!profileLoading && !hasDynamicProfile)) {
        return (
            <Container>
                <Row className="mb-4">
                    <Col sm={12}>
                        <StyledFormText className="text-center py-4">
                            Please complete the Basic Product Info tab first.
                        </StyledFormText>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            {/* Show skeleton while profile is loading */}
            {profileLoading && (
                <Row className="mb-4">
                    <Col sm={12}>
                        <SkeletonLoading rows={2} height={[60, 60]} />
                    </Col>
                </Row>
            )}

            {/* Render dynamic fields when profile is loaded */}
            {!profileLoading && hasDynamicProfile && (
                <DynamicFormRenderer tabConfig={tabConfig} loading={false} />
            )}
        </Container>
    );
};

export default KeyDateSchedules;
