import React, { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import VerticleCollapsContainer from '../components/common/VerticleCollapsContainer';
import CaseManagementSideBar from '../components/casemanagement/CaseManagementSideBar';
import CaseManagementList from '../components/casemanagement/CaseManagementList';
import ProductSetup from '../components/casemanagement/ProductSetup';
import Subscription from '../components/casemanagement/Subscription';
import { useParams, useLocation } from 'react-router-dom';
import ContentArea from '../components/common/ContentArea';
import { CompartmentStatus } from '../types/CompartmentStatus';
import { useCaseStatus } from '../hooks/useCaseStatus';
import Issued from '../components/casemanagement/Issued';

const CaseManagementPage: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const location = useLocation();
    
    const [heading, setHeading] = useState<string>('');
    const [subHeading, setSubHeading] = useState<string>('');

    const { caseData, isCaseFreezed, getCaseLockReason, getCaseStatusMessage } = useCaseStatus();

    useEffect(() => {
        setSubHeading('');
        setSubHeading('');
        const path = location.pathname;
        if (path.endsWith('/subscriptions')) {
            setHeading('Subscriptions');
            setSubHeading(getCaseStatusMessage() || '');
        } else if (path.endsWith('/compartment-overview')) {
            setHeading('Compartment Overview');
            setSubHeading(getCaseStatusMessage() || '');
        } else {
            setHeading('Product Setup');
            if(isCaseFreezed) {
                const lockReason = getCaseLockReason();
                setSubHeading(lockReason || 'Product setup is frozen.');
            }
        }
    }, [location.pathname, caseData, isCaseFreezed, getCaseLockReason]);

    const renderComponentByPath = () => {
        const path = location.pathname;
        if (path.endsWith('/subscriptions')) {
            return <Subscription />;
        } else if (path.endsWith('/compartment-overview')) {
            return <Issued />;
        } else {
            return <ProductSetup />;
        }
    }

    return (
        <Container fluid>
            <Row className="d-flex flex-nowrap">
                <VerticleCollapsContainer sm={3} md={3} xs={3} titleText="Case Management">
                    <CaseManagementList />
                </VerticleCollapsContainer>
                {caseId && (
                    <>
                        <VerticleCollapsContainer sm={3} md={3} xs={3} titleText="Compartment">
                            <CaseManagementSideBar caseId={caseId} />
                        </VerticleCollapsContainer>
                        <ContentArea 
                            sm={6} 
                            md={6}
                            header={heading}
                            subHeader={subHeading}
                            body={renderComponentByPath()}
                        />
                    </>
                )}
            </Row>
        </Container>
    );
}

export default CaseManagementPage;