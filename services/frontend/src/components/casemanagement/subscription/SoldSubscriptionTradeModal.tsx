import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import SubscriptionTradeTable from './SubscriptionTradeTable';
import { SubscriptionTrade } from '../../../services/api/graphQL/subscriptionTrades/types/subscriptionTrades';
import { StyledModal, StyledModalHeader, StyledModalBody, StyledModalFooter } from '../../styled/CommonStyled';
import styled from 'styled-components';
import { currencyUtils } from '../../../utils/formatters';
import { FaFileCircleXmark } from 'react-icons/fa6';

// Styled summary box that uses theme colors
const SummaryBox = styled.div`
  background-color: ${({ theme }) => theme.hoverLight};
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const EmptyStateText = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.textMuted};
`;

interface SoldSubscriptionTradeModalProps {
    show: boolean;
    onHide: () => void;
    isinNumber: string;
    isinCurrency: string;
    soldTrades: SubscriptionTrade[];
    caseId: string;
}

export const SoldSubscriptionsTradeModal: React.FC<SoldSubscriptionTradeModalProps> = ({
    show,
    onHide,
    isinNumber,
    isinCurrency,
    soldTrades,
    caseId
}) => {

    // Calculate totals from historical data
    const totalNotional = soldTrades.reduce((sum, trade) => sum + (trade.notional || 0), 0);
    
    const totalSettlementAmount = soldTrades.reduce((sum, trade) => {
        const notional = trade.notional || 0;
        const issuePrice = trade.issueprice || 0;
        const salesFee = trade.salesfee || 0;
        return sum + (notional * issuePrice / 100) + salesFee;
    }, 0);

    return (
        <StyledModal 
            show={show} 
            onHide={onHide} 
            size="xl" 
            centered
            backdrop="static"
        >
            <StyledModalHeader closeButton>
                <h5 className="modal-title">
                    <FaFileCircleXmark /> Cancelled - {isinNumber} ({isinCurrency})
                </h5>
            </StyledModalHeader>

            <StyledModalBody>
                <Row>
                    <Col>
                        {soldTrades.length > 0 ? (
                            <SubscriptionTradeTable
                                data={soldTrades}
                                caseId={caseId}
                                isEditable={false} // Historical data should be read-only
                                isLoading={false}
                                currency={isinCurrency}
                            />
                        ) : (
                            <EmptyStateText>
                                No Sold subscriptions available!
                            </EmptyStateText>
                        )}
                    </Col>
                </Row>
            </StyledModalBody>
        </StyledModal>
    );
};

export default SoldSubscriptionsTradeModal;