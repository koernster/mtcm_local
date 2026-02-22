import React from 'react';
import { Col, InputGroup, Row, Spinner } from 'react-bootstrap';
import { BorderDiv,  StyledButton,  StyledFormControl, StyledListGroup, StyledListGroupItem } from '../styled/CommonStyled';
import { FaCheck, FaMagnifyingGlass, FaPlus } from 'react-icons/fa6';
import InputWrapper from '../common/InputWrapper';
import { H6, Small } from '../styled/TypographyStyled';
import { dateUtils } from '../../utils/formatters';

const items = [
    { id: 1, title: '2024-01-15', description: 'Mixed performance: SPX Capital outperforming at 107.28%, CLN Green Energy underperforming at 60%, most instruments stable.' },
    { id: 2, title: '2024-01-14', description: 'Market volatility impacted our bond holdings today. Need to review allocation strategy.' },
    { id: 3, title: '2024-01-13', description: 'Weekly reconciliation complete. Found minor discrepancy in foreign currency positions - investigating.' },
    { id: 4, title: '2024-01-12', description: 'Great month for equity performance! Distribution yield exceeded expectations at 3.4%' },
    { id: 5, title: '2024-01-11', description: 'Monthly audit went smoothly. All valuations verified by independent auditor.' },
    { id: 6, title: '2024-01-10', description: 'Dividend impact was as expected. Shareholders should see distribution in their accounts soon.' },
    { id: 7, title: '2024-01-09', description: 'Bond revaluation taking longer than usual due to credit spread widening. Will update by EOD.' },
    { id: 8, title: '2024-01-08', description: 'Class A performance metrics updated. Outperforming benchmark by 150 basis points YTD.' },
    { id: 9, title: '2024-01-07', description: 'Alternative investments showing resilience in current market conditions. Fair value adjustments minimal.' },
    { id: 10, title: '2024-01-06', description: 'Large subscription inflow today ($500K). Will deploy capital gradually over next two weeks.' },
    { id: 11, title: '2024-01-05', description: 'FX impact was significant today due to USD strength. Hedging strategy performing well.' },
    { id: 12, title: '2024-01-04', description: 'Solid year-end numbers! Annual report shows 12.3% net return. Team did excellent work.' },
    { id: 13, title: '2024-01-03', description: 'Expense accruals updated. Management fee calculation verified with operations team.' },
    { id: 14, title: '2024-01-02', description: 'New year rebalancing complete. Increased tech allocation as discussed in investment committee.' },
    { id: 15, title: '2024-01-01', description: 'Holiday processing routine. System automatically carried forward values with accrued interest.' },
];



const NavReportingList: React.FC = () => {
    return <div style={{ height: '90vh', maxHeight: '90vh' }}>
        <BorderDiv>
            <Col sm={12} md={12}>
                <InputGroup>
                    <InputWrapper 
                        leftIcon={<FaMagnifyingGlass />}
                        style={{ flex: 1 }}
                    >
                        <StyledFormControl 
                            type="text"
                            placeholder="Search"
                            style={{
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0
                            }}
                        />
                    </InputWrapper> 
                    <InputGroup.Text 
                        as={StyledButton}
                        variant="primary"
                        style={{
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            padding: '6px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {/* {creatingCase ? (
                            <Spinner animation="border" size="sm" />
                        ) : ( */}
                            <>
                                <FaPlus size={16} />
                                <span>New</span>
                            </>
                        {/* )} */}
                    </InputGroup.Text>
                </InputGroup>
            </Col>
        </BorderDiv>
        <Col sm={12} md={12} style={{ height:'80vh', maxHeight:'90vh', overflow: 'auto' }}>
            <StyledListGroup>
                {items.map(item => (
                    <StyledListGroupItem key={item.id} >
                        <Row>
                            <Col sm={2} className="d-flex align-items-center justify-content-center">
                                { item.id % 2 === 0
                                    ? <FaCheck color="green" /> 
                                    : <Spinner animation="border" size="sm" />
                                }
                                    
                            </Col>
                            <Col sm={10}>
                                <H6>{dateUtils.format(item.title)}</H6>
                                <Small>
                                    {item.description}
                                </Small>
                            </Col>
                        </Row>
                    </StyledListGroupItem>
                ))}
            </StyledListGroup>
        </Col>
    </div>;
}

export default NavReportingList;