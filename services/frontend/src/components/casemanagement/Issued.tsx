import React, { useState } from 'react';
import { Card, Col, Row, Badge, Button, Table } from 'react-bootstrap';
import { 
    DataLabel, 
    DataValue, 
    KanbanContainer, 
    StyledCardHeader 
} from '../styled/CommonStyled';
import { 
    FaExternalLinkAlt
} from 'react-icons/fa';
import { useCaseSetup } from '../../hooks/useCaseSetup';
import { useCaseStatus } from '../../hooks/useCaseStatus';
import { useSubscriptionTrades } from '../../hooks/useSubscriptionTrades';
import { Label, Heading, Small } from '../styled/TypographyStyled';
import SkeletonLoading from '../common/SkeletonLoader';
import { CompartmentStatus } from '../../types/CompartmentStatus';
import { useNavigate } from 'react-router-dom';
import { currencyUtils, dateUtils } from '../../utils/formatters';

const Issued: React.FC = () => {
    const { 
        loading, 
        error, 
        caseData,
        isinEntries,
        isinsLoading,
        isinsError
    } = useCaseSetup();

    const {  canAcceptSubscriptions, isCaseIssued, getCaseStatusMessage } = useCaseStatus();

    const navigate = useNavigate();
    
    // TODO: Add canAcceptBuySell logic when buy/sell functionality is implemented
    const canAcceptBuySell = caseData?.productsetupstatusid === CompartmentStatus.CASE_FREEZED;

    const { 
        currentTrades, 
    } = useSubscriptionTrades(caseData?.id || '');

    const formatCurrency = (value: number) => {
        return currencyUtils.formatWithoutSymbol(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return dateUtils.format(dateString);
    };

    const calculateTotals = () => {
        const totalNotional = currentTrades.reduce((sum, trade) => sum + (trade.notional || 0), 0);
        const totalSettlement = currentTrades.reduce((sum, trade) => {
            const settlement = (trade.price_dirty || 0) * (trade.notional || 0);
            return sum + settlement;
        }, 0);
        const totalSalesFee = currentTrades.reduce((sum, trade) => sum + (trade.salesfee || 0), 0);
        return { totalNotional, totalSettlement, totalSalesFee };
    };

    const renderISINLinks = () => {
        if (isinsLoading) {
            return <SkeletonLoading rows={1} height={[40]} />;
        }

        if (isinsError || !isinEntries || isinEntries.length === 0) {
            return <Small className='text-muted'>No ISINs available</Small>;
        }

        return (
            <div className="d-flex flex-wrap gap-2">
                {isinEntries.map((entry) => (
                    <Button
                        key={entry.id}
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleNavigateToBuySell(entry.id)}
                        className="d-flex align-items-center"
                    >
                        {entry.isinNumber || 'Unnamed ISIN'}
                        <FaExternalLinkAlt className="ms-2" size={12} />
                    </Button>
                ))}
            </div>
        );
    };

    const renderDetailedSummary = () => {
        if (loading) {
            return <SkeletonLoading rows={8} height={[25, 25, 25, 25, 25, 25, 25, 25]} />;
        }

        if (error) {
            return <Label className='text-danger'>Error loading product data</Label>;
        }

        const { totalNotional, totalSettlement, totalSalesFee } = calculateTotals();

        return (
            <Row className="g-4">
                {/* Basic Information */}
                <Col md={6}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">Basic Information</StyledCardHeader>
                        <div className="p-3">
                            <Row className="g-2">
                                <Col sm={12}>
                                    <DataLabel>Client Name: </DataLabel>
                                    <DataValue>{caseData?.company?.companyname || 'N/A'}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Compartment: </DataLabel>
                                    <DataValue>{caseData?.compartmentname || 'N/A'}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Issue Date: </DataLabel>
                                    <DataValue>{formatDate(caseData?.issuedate || '')}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Maturity Date: </DataLabel>
                                    <DataValue>{formatDate(caseData?.maturitydate || '')}</DataValue>
                                </Col>
                            </Row>
                        </div>
                    </KanbanContainer>
                </Col>

                {/* Financial Summary */}
                <Col md={6}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">Financial Summary</StyledCardHeader>
                        <div className="p-3">
                            <Row className="g-2">
                                <Col sm={12}>
                                    <DataLabel>Total ISINs: </DataLabel>
                                    <DataValue>{isinEntries?.length || 0}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Active Subscriptions: </DataLabel>
                                    <DataValue>{currentTrades.length}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Total Notional: </DataLabel>
                                    <DataValue>{formatCurrency(totalNotional)}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Total Settlement: </DataLabel>
                                    <DataValue>{formatCurrency(totalSettlement)}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Total Sales Fees: </DataLabel>
                                    <DataValue>{formatCurrency(totalSalesFee)}</DataValue>
                                </Col>
                            </Row>
                        </div>
                    </KanbanContainer>
                </Col>

                {/* Fee Structure */}
                <Col md={6}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">Fee Structure</StyledCardHeader>
                        <div className="p-3">
                            <Row className="g-2">
                                <Col sm={12}>
                                    <DataLabel>Distribution paid by Investor: </DataLabel>
                                    <DataValue>{caseData?.casesubscriptiondata?.distributionpaidbyinvs ? 'Yes' : 'No'}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Sales Fee paid by Investor: </DataLabel>
                                    <DataValue>{caseData?.casesubscriptiondata?.salesfeepaidbyinves ? 'Yes' : 'No'}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Sales Fee on Issue Date: </DataLabel>
                                    <DataValue>
                                        {caseData?.casesubscriptiondata?.salesnotpaidissuedate 
                                            ? `${caseData.casesubscriptiondata.salesnotpaidissuedate}%` 
                                            : 'N/A'}
                                    </DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Sales Fee on Maturity Date: </DataLabel>
                                    <DataValue>
                                        {caseData?.casesubscriptiondata?.salesnotpaidmaturitydate 
                                            ? `${caseData.casesubscriptiondata.salesnotpaidmaturitydate}%` 
                                            : 'N/A'}
                                    </DataValue>
                                </Col>
                            </Row>
                        </div>
                    </KanbanContainer>
                </Col>

                {/* Trading Status */}
                <Col md={6}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">Trading Status</StyledCardHeader>
                        <div className="p-3">
                            <Row className="g-2">
                                <Col sm={12}>
                                    <DataLabel>Subscriptions: </DataLabel>
                                    <DataValue>{canAcceptSubscriptions ? 'Open' : 'Closed'}</DataValue>
                                </Col>
                                <Col sm={12}>
                                    <DataLabel>Buy/Sell Trading: </DataLabel>
                                    <DataValue>{canAcceptBuySell ? 'Open' : 'Closed'}</DataValue>
                                </Col>
                            </Row>
                        </div>
                    </KanbanContainer>
                </Col>
            </Row>
        );
    };

    const handleNavigateToBuySell = (isinId: string) => {
        navigate(`/buy-sell/${isinId}`); // Navigate to buy/sell screen for specific ISIN
        //${isinId}
    };

    return (
        <div className="container-fluid p-0">
            {/* ISIN Quick Links */}
            <Row className="mb-4">
                <Col sm={12}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">
                            ISIN Buy/Sell Links
                        </StyledCardHeader>
                        <div className="p-3">
                           {
                                isCaseIssued ? renderISINLinks() : <Label>{getCaseStatusMessage() + ' Right after that you can do buy and sell.' || 'Compartment is not issued yet.'}</Label>
                           }
                        </div>
                    </KanbanContainer>
                </Col>
            </Row>

            {/* Detailed Summary */}
            <Row>
                <Col sm={12}>
                    <KanbanContainer>
                        <StyledCardHeader as="h6">
                            Product Summary
                        </StyledCardHeader>
                        <div className="p-3">
                            {renderDetailedSummary()}
                        </div>
                    </KanbanContainer>
                </Col>
            </Row>
        </div>
    );
};

export default Issued;