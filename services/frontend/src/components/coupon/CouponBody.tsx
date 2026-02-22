import React, { useState } from 'react';
import { Col, Row, Tab, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useCouponPayment } from '../../hooks/useCouponPayment';
import { useTheme } from '../../context/ThemeContext';
import CouponDetailsCard from './CouponDetailsCard';
import LoanBalanceTable from './LoanBalanceTable';
import PaymentTable from './PaymentTable';
import { H5, Label, Small } from '../styled/TypographyStyled';
import { 
    StyledTabs, 
    ErrorIcon, 
    WarningIcon, 
    InfoIcon, 
    ErrorText, 
    MessageText, 
    HelpText, 
    TabTitle 
} from '../styled/CommonStyled';
import SkeletonLoading from '../common/SkeletonLoader';

interface CouponBodyProps {
    onActiveIsinChange?: (activeIsin: {
        isinId: string;
        isinCode: string;
        caseName: string;
    } | null) => void;
}

const CouponBody: React.FC<CouponBodyProps> = ({ onActiveIsinChange }) => {
    const { caseId } = useParams<{ caseId: string }>();
    const [key, setKey] = useState<string>('0');
    const { theme } = useTheme();
    
    // Load coupon payment data using the hook
    const { couponPayments, loading, couponPaymentsError } = useCouponPayment(caseId || null);
    
    // Get case data for print
    const { caseData } = useSelector((state: RootState) => state.caseSetup);
    
    // Notify parent when active ISIN changes
    React.useEffect(() => {
        if (onActiveIsinChange && couponPayments.length > 0 && !loading) {
            const activeTabIndex = parseInt(key) || 0;
            const activeCouponPayment = couponPayments[activeTabIndex];
            
            if (activeCouponPayment) {
                onActiveIsinChange({
                    isinId: activeCouponPayment.isinId,
                    isinCode: activeCouponPayment.isinNumber,
                    caseName: caseData?.compartmentname || ''
                });
            }
        } else if (onActiveIsinChange && (loading || couponPayments.length === 0)) {
            onActiveIsinChange(null);
        }
    }, [key, couponPayments, loading, caseData, onActiveIsinChange]);

    // Set appropriate tab as active based on loading state
    React.useEffect(() => {
        if (loading) {
            setKey('loading');
        } else if (couponPaymentsError) {
            setKey('error');
        } else if (couponPayments.length === 0) {
            setKey('no-data');
        } else if (couponPayments.length > 0) {
            setKey('0');
        }
    }, [loading, couponPaymentsError, couponPayments]);

    const renderSkeletonTabs = () => {
        return (
            <Tab eventKey="loading" title={
                <TabTitle>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Loading...
                </TabTitle>
            }>
                <Row className="mt-3">
                    <Col md={8}>
                        <Label className='fw-bold mb-3'>Payment Overview</Label>
                        <div className="table-responsive" style={{ 
                            height: '50vh', 
                            border: `1px solid ${theme.border}`
                        }}>
                            <div className="p-3">
                                <SkeletonLoading rows={1} height={[40]} width={['100%']} />
                                <SkeletonLoading rows={5} height={[35]} width={['100%']} />
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <Label className='fw-bold mb-3'>Loan Balance Overview</Label>
                        <div className="table-responsive" style={{ 
                            height: '50vh', 
                            border: `1px solid ${theme.border}`
                        }}>
                            <div className="p-3">
                                <SkeletonLoading rows={1} height={[40]} width={['100%']} />
                                <SkeletonLoading rows={6} height={[35]} width={['100%']} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Tab>
        );
    };

    const renderErrorTab = () => {
        return (
            <Tab eventKey="error" title={
                <TabTitle>
                    <ErrorIcon className="me-1" />
                    Error
                </TabTitle>
            }>
                <Row className="mt-3">
                    <Col className="text-center p-5">
                        <ErrorIcon size={48} className="mb-3" />
                        <ErrorText>Error Loading Data</ErrorText>
                        <MessageText>{couponPaymentsError}</MessageText>
                        <HelpText>
                            Please try refreshing the page or contact support if the issue persists.
                        </HelpText>
                    </Col>
                </Row>
            </Tab>
        );
    };

    const renderNoDataTab = () => {
        return (
            <Tab eventKey="no-data" title={
                <TabTitle>
                    <WarningIcon className="me-1" />
                    No Data
                </TabTitle>
            }>
                <Row className="mt-3">
                    <Col className="text-center p-5">
                        <WarningIcon size={48} className="mb-3" />
                        <ErrorText>No Coupon Payments Available</ErrorText>
                        <HelpText>
                            Coupon payment data may not have been processed yet or this case may not have any payment history.
                        </HelpText>
                    </Col>
                </Row>
            </Tab>
        );
    };

    return (
        <>
            <Row>
                <Col>
                    <CouponDetailsCard
                        isinId={couponPayments[parseInt(key)]?.isinId}
                        loading={loading}
                        currency={couponPayments[parseInt(key)]?.paymentOverview[0]?.currency || 'USD'}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <StyledTabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k as string)}
                    >
                        {loading ? (
                            renderSkeletonTabs()
                        ) : couponPaymentsError ? (
                            renderErrorTab()
                        ) : couponPayments.length === 0 ? (
                            renderNoDataTab()
                        ) : (
                            couponPayments.map((couponPayment, index) => (
                                <Tab eventKey={index.toString()} title={couponPayment.isinNumber} key={couponPayment.isinId}>
                                    <Row className="mt-3">
                                        <Col md={8}>
                                            <Label className='fw-bold'>
                                                Payment Overview
                                            </Label>
                                            <PaymentTable 
                                                isinId={couponPayment.isinId} 
                                                loading={loading}
                                                currency={couponPayment.paymentOverview[0]?.currency || 'USD'}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <Label className='fw-bold'>
                                                Loan Balance Overview
                                            </Label>
                                            <LoanBalanceTable 
                                                isinId={couponPayment.isinId} 
                                                loading={loading}
                                            />
                                        </Col>
                                    </Row>
                                </Tab>
                            ))
                        )}
                    </StyledTabs>
                </Col>
            </Row>
        </>
    );
};

export default CouponBody;
