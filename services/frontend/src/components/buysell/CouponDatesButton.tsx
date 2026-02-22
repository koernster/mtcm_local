import React from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { FaCalendarDays } from 'react-icons/fa6';
import { dateUtils } from '../../utils/formatters';
import { useSelector } from 'react-redux';
import { StyledPopover, StyledPopoverBody, StyledPopoverHeader } from '../styled/CommonStyled';

interface CouponDatesButtonProps {
    couponDates: Date[];
    showCouponDates: boolean;
    setShowCouponDates: (show: boolean) => void;
}

const CouponDatesButton: React.FC<CouponDatesButtonProps> = ({ 
    couponDates, 
    showCouponDates, 
    setShowCouponDates 
}) => {
    const { isinData } = useSelector((state: any) => state.buySell);

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom"
            show={showCouponDates}
            onToggle={setShowCouponDates}
            overlay={
                <StyledPopover id="coupon-dates-popover" style={{ minWidth: '300px', maxWidth: '400px' }}>
                    <StyledPopoverHeader as="h6">
                        Coupon Payment Dates
                    </StyledPopoverHeader>
                    <StyledPopoverBody style={{ maxHeight: '300px', overflowY: 'auto', padding: '12px' }}>
                        {couponDates.length > 0 ? (
                            <div>
                                <p style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                                    <strong>Frequency:</strong> {isinData?.couponFrequency || 'N/A'}
                                </p>
                                <div style={{ fontSize: '0.85rem' }}>
                                    <strong>Payment Dates:</strong>
                                    <ul style={{ marginTop: '4px', paddingLeft: '16px', marginBottom: '0' }}>
                                        {couponDates.map((date, index) => (
                                            <li key={index} style={{ marginBottom: '2px' }}>
                                                {dateUtils.format(date, { format: 'long' })}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                No coupon payment dates available
                            </div>
                        )}
                    </StyledPopoverBody>
                </StyledPopover>
            }
        >
            <Button 
                variant="outline-info" 
                size="sm"
                onClick={() => setShowCouponDates(!showCouponDates)}
            >
                <FaCalendarDays style={{ marginRight: '6px' }} />
                Coupon Dates
            </Button>
        </OverlayTrigger>
    );
};

export default CouponDatesButton;
