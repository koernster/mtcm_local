import React, { useState } from 'react';
import { Accordion, Row, Col, Container } from 'react-bootstrap';
import { Label, Text as ThemedText } from '../styled/TypographyStyled';
import { useCouponInfo } from '../../hooks/useCouponInfo';
import SkeletonLoading from '../common/SkeletonLoader';
import { StyledAccordionBody, StyledAccordionHeader, StyledAccordionItem } from '../styled/AccordianStyled';
import { FaAngleDown, FaAngleUp, FaInfoCircle } from 'react-icons/fa';
import { EmptyStateText, HelpText, InfoIcon, StyledTable } from '../styled/CommonStyled';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { currencyUtils, dateUtils, percentageUtils } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface CouponDetailsCardProps {
    isinId: string;
    loading?: boolean;
    currency?: string;
}

const CouponDetailsCard: React.FC<CouponDetailsCardProps> = ({ isinId, loading, currency }) => {
    const { theme } = useTheme();
    
    const [activeKey, setActiveKey] = useState<string | null>(null);
    
    // Get case data for print
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);

    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);

    const handleAccordionToggle = () => {
        setActiveKey(activeKey === "0" ? null : "0");
    };

    const renderEndArrow = () => {
        return <div className='float-end'>
            {activeKey === "0" ? <FaAngleUp /> : <FaAngleDown />}
        </div>;
    };

    if (loading) {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        <SkeletonLoading height={[50]} />
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!currentIsinData)
    {
        return <Container fluid>
            <Row>
                <Col>
                   <div className='table-responsive' style={{ 
                                   height: '20vh', 
                                   overflowY: 'auto', 
                                   border: `1px solid ${theme.border}`,
                                   marginBottom: '15px',
                               }}>
                        <div className="text-center p-3">
                            <InfoIcon size={32} className="mb-3" />
                            <EmptyStateText>No Data Available</EmptyStateText>
                            <HelpText>
                                Payment overview data has not been generated for this ISIN yet.
                            </HelpText>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>;
    }
    var test = (
        <StyledTable 
            bordered
            hover
        >
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>2024-09-01</td>
                    <td>1,500.00 USD</td>
                </tr>
                <tr>
                    <td>2024-03-01</td>
                    <td>1,500.00 USD</td>
                </tr>
                <tr>
                    <td>2023-09-01</td>
                    <td>1,500.00 USD</td>
                </tr>
                <tr>
                    <td>2023-03-01</td>
                    <td>1,500.00 USD</td>
                </tr>
                <tr>
                    <td>2022-09-01</td>
                    <td>1,500.00 USD</td>
                </tr>
                <tr>
                    <td>2022-03-01</td>
                    <td>1,500.00 USD</td>
                </tr>
            </tbody>
        </StyledTable>
        );

    return (
        <Accordion activeKey={activeKey} flush>
            <StyledAccordionItem as={Accordion.Item} eventKey="0">
                <StyledAccordionHeader onClick={handleAccordionToggle}>
                    Compartment Overview
                    {renderEndArrow()}
                </StyledAccordionHeader>
                <StyledAccordionBody as={Accordion.Body}>
                    <Row>
                        <Col md={12}>
                            <StyledTable 
                                bordered
                                hover
                            >
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Issue Date</th>
                                        <th>Maturity Date</th>
                                        <th>Issue Price</th>
                                        <th>Redemption Price</th>
                                        <th>Coupon/Interest</th>
                                        <th>Frequency</th>
                                        <th>Day Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Security Details</th>
                                        <td>{dateUtils.format(currentIsinData?.issueDate)}</td>
                                        <td>{dateUtils.format(currentIsinData?.maturityDate)}</td>
                                        <td>{currencyUtils.format(currentIsinData?.issuePrice)}</td>
                                        <td>0.00</td>
                                        <td>0.00</td>
                                        <td>{currentIsinData?.couponFrequency}</td>
                                        <td>360</td>
                                    </tr>
                                    <tr>
                                        <th>Loan Details</th>
                                        <td>{dateUtils.format(currentIsinData?.issueDate)}</td>
                                        <td>{dateUtils.format(currentIsinData?.maturityDate)}</td>
                                        <td>{currencyUtils.format(currentIsinData?.issuePrice)}</td>
                                        <td>0.00</td>
                                        <td>
                                            <ul>
                                                {couponPayments.map((item) => (
                                                    <li key={item.isinId}>
                                                        {item.isinNumber}: {percentageUtils.format(item.couponInterest?.interestRate || 0)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td>{currentIsinData?.couponFrequency}</td>
                                        <td>360</td>
                                    </tr>
                                </tbody>
                            </StyledTable>
                        </Col>
                    </Row>
                    <Row>
                        {[1,2,3].map((item) => (
                            <Col key={item} md={4}>
                                <Label className='fw-bold'>
                                    ISIN {item}
                                </Label>
                                {test}
                            </Col>
                        ))}

                    </Row>
                </StyledAccordionBody>
            </StyledAccordionItem>
        </Accordion>
    );
};

export default CouponDetailsCard;
