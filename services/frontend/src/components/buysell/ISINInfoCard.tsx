import React from 'react';
import { Card, Row, Col, Alert, Button, OverlayTrigger } from 'react-bootstrap';
import { StyledCard, StyledFormControl, StyledPopover, StyledPopoverHeader, StyledPopoverBody } from '../styled/CommonStyled';
import { Label, Text as ThemedText } from '../styled/TypographyStyled';
import { BuySellIsinData } from '../../services/api/graphQL/caseisins/types/caseisins';
import { CouponInterest } from '../../services/api/graphQL/couponinterest/types/couponinterest';
import { dateUtils, percentageUtils } from '../../utils/formatters';
import SkeletonLoading from '../common/SkeletonLoader';
import { CouponTypes } from '../../types/CouponTypes';
import PercentageInput from '../common/PercentageInput';
import { FaHistory } from 'react-icons/fa';
import InputWrapper from '../common/InputWrapper';

interface ISINInfoCardProps {
    isinData: BuySellIsinData | null;
    couponInterests: CouponInterest[];
    loading: boolean;
    error: Error | null;
    onUpdateInterestRate?: (couponInterestId: string, interestRate: number) => Promise<CouponInterest>;
}

const ISINInfoCard: React.FC<ISINInfoCardProps> = ({ 
    isinData, 
    couponInterests, 
    loading, 
    error, 
    onUpdateInterestRate 
}) => {
    const [showRateHistory, setShowRateHistory] = React.useState(false);
    const [isUpdatingRate, setIsUpdatingRate] = React.useState(false);

    // Show loading skeleton
    if (loading) {
        return (
            <StyledCard animate={false}>
                <Card.Body style={{ padding: '0.75rem' }}>
                    <SkeletonLoading 
                        rows={2}
                        height={[20, 20]}
                        width={['100%', '100%']}
                    />
                </Card.Body>
            </StyledCard>
        );
    }

    // Show error message
    if (error) {
        return (
            <StyledCard animate={false}>
                <Card.Body style={{ padding: '0.75rem' }}>
                    <Alert variant="danger" style={{ margin: '0' }}>
                        Error loading ISIN data: {error.message}
                    </Alert>
                </Card.Body>
            </StyledCard>
        );
    }

    // Show message when no data
    if (!isinData) {
        return (
            <StyledCard animate={false}>
                <Card.Body style={{ padding: '0.75rem' }}>
                    <Alert variant="info" style={{ margin: '0' }}>
                        No ISIN data available
                    </Alert>
                </Card.Body>
            </StyledCard>
        );
    }

    // show a popover on coupon rate history icon click
    const historyPopover = () => {
        // Sort coupon interests by event date (most recent first)
        const sortedCouponInterests = [...couponInterests]
            .filter(ci => ci.eventdate) // Only show entries with event dates
            .sort((a, b) => new Date(b.eventdate!).getTime() - new Date(a.eventdate!).getTime());

         return (
            <OverlayTrigger
                trigger="click"
                placement="bottom"
                show={showRateHistory}
                onToggle={setShowRateHistory}
                overlay={
                    <StyledPopover id="coupon-dates-popover">
                        <StyledPopoverHeader as="h6">
                            Historical Rates
                        </StyledPopoverHeader>
                        <StyledPopoverBody>
                            {sortedCouponInterests.length > 0 ? (
                                <div>
                                    <ul>
                                        {sortedCouponInterests.map((couponInterest, index) => (
                                            <li key={couponInterest.id} style={{ fontWeight: currentCouponInterest?.id === couponInterest.id ? 'bold' : 'normal' }}>
                                                (Cutoff: {dateUtils.format(new Date(couponInterest.eventdate!))}) - {percentageUtils.format(couponInterest.interestrate)} 
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                    No historical rates available
                                </div>
                            )}
                        </StyledPopoverBody>
                    </StyledPopover>
                }
            >
                <span style={{ cursor: 'pointer' }} onClick={() => setShowRateHistory(!showRateHistory)}>
                    <FaHistory />
                </span>
            </OverlayTrigger>
        );
    };

    // Get the current coupon interest (by status == 1)
    const getCurrentCouponInterest = (): CouponInterest | null => {
        if (couponInterests.length === 0) return null;
        
        // Find coupon interest with status == 1 (current/active)
        const currentCoupon = couponInterests.find(ci => ci.status === 1);
        
        // If no active coupon found, fallback to most recent or first one
        if (!currentCoupon) {
            return couponInterests.length === 1 
                ? couponInterests[0] 
                : couponInterests.reduce((latest, current) => {
                    if (!latest.eventdate) return current;
                    if (!current.eventdate) return latest;
                    return new Date(current.eventdate) > new Date(latest.eventdate) ? current : latest;
                });
        }
        
        return currentCoupon;
    };

    // Handle interest rate change for floating rates
    const handleInterestRateChange = async (value: number | null) => {
        if (!onUpdateInterestRate || value === null) return;
        
        const currentCouponInterest = getCurrentCouponInterest();
        if (!currentCouponInterest) return;

        try {
            setIsUpdatingRate(true);
            await onUpdateInterestRate(currentCouponInterest.id, value);
        } catch (err) {
            console.error('Failed to update interest rate:', err);
        } finally {
            setIsUpdatingRate(false);
        }
    };

    const currentCouponInterest = getCurrentCouponInterest();    

    return (
        <StyledCard animate={false}>
            <Card.Body style={{ padding: '0.75rem' }}>
                <Row>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>ISIN:&nbsp;</Label>
                        <ThemedText>{isinData.isinnumber || 'Unnamed ISIN'}</ThemedText>
                    </Col>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Currency:&nbsp;</Label>
                        <ThemedText>{isinData?.currencyName} ({isinData?.currencyShortName})</ThemedText>
                    </Col>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Coupon Type:&nbsp;</Label>
                        <ThemedText>{isinData.couponTypeName}</ThemedText>
                    </Col>
                    <Col md={isinData.couponTypeId === CouponTypes.FIXED ? 2 : 3} className="mb-2">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <Label style={{ fontWeight: 'bold' }}>Current Coupon Rate:&nbsp;</Label>
                            <div>
                                {
                                    (isinData.couponTypeId === CouponTypes.FIXED ? 
                                    (<ThemedText>{percentageUtils.format(currentCouponInterest?.interestrate ?? 0)}</ThemedText>):
                                    (
                                        <InputWrapper 
                                            style={{ maxWidth: '110px' }} 
                                            rightIcon={historyPopover()}
                                            isLoading={isUpdatingRate}
                                        >
                                            <PercentageInput
                                                size="sm"
                                                value={currentCouponInterest?.interestrate || 0}
                                                onChange={()=>{}}
                                                onBlur={handleInterestRateChange}
                                                disabled={isUpdatingRate} />
                                        </InputWrapper>
                                    ))
                                }
                            </div>
                        </div>
                    </Col>
                     <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Coupon Frequency:&nbsp;</Label>
                        <ThemedText>{isinData.couponFrequency}</ThemedText>
                    </Col>
                </Row>
                <Row>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Issue Date:&nbsp;</Label>
                        <ThemedText>{dateUtils.format(isinData.issueDate)}</ThemedText>
                    </Col>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Maturity:&nbsp;</Label>
                        <ThemedText>{dateUtils.format(isinData.maturityDate)}</ThemedText>
                    </Col>
                    <Col md={2} className="mb-2">
                        <Label style={{ fontWeight: 'bold' }}>Issue Price:&nbsp;</Label>
                        <ThemedText>{isinData.issueprice}</ThemedText>
                    </Col>
                </Row>
            </Card.Body>
        </StyledCard>
    );
};

export default ISINInfoCard;
