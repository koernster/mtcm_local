import React, { useState } from 'react';
import { Container, Row, Button, Dropdown } from 'react-bootstrap';
import ISINListWithFilter from '../components/businesscommon/ISINListWithFilter';
import VerticleCollapsContainer from '../components/common/VerticleCollapsContainer';
import ContentArea from '../components/common/ContentArea';
import CouponBody from '../components/coupon/CouponBody';
import InvoicePrint from '../components/coupon/prints/InvoicePrint';
import CouponPrint from '../components/coupon/prints/CouponPrint';
import { PrintModal, PrintButton } from '../components/common/print';
import { useParams } from 'react-router-dom';
import { useCouponPayment } from '../hooks/useCouponPayment';
import InterestCalcOverviewPrint from '../components/coupon/prints/InterestCalcOverviewPrint';

const CouponPage: React.FC = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printData, setPrintData] = useState<{
        isinId: string;
        isinCode: string;
        caseName: string;
        printAll?: boolean;
        printType?: 'invoice' | 'coupon';
        allIsins?: Array<{ isinId: string; isinCode: string; caseName: string; }>;
    } | null>(null);
    
    // Track current active ISIN for print button
    const [currentActiveIsin, setCurrentActiveIsin] = useState<{
        isinId: string;
        isinCode: string;
        caseName: string;
    } | null>(null);

    // Get all coupon payments for dropdown options
    const { couponPayments, loading } = useCouponPayment(caseId || null);

    const handlePrintCurrentIsin = (printType: 'invoice' | 'coupon' = 'invoice') => () => {
        if (currentActiveIsin) {
            setPrintData({
                ...currentActiveIsin,
                printAll: false,
                printType
            });
            setShowPrintModal(true);
        }
    };

    const handlePrintSpecificIsin = (isinId: string, isinCode: string, caseName: string, printType: 'invoice' | 'coupon' = 'invoice') => () => {
        setPrintData({
            isinId,
            isinCode,
            caseName,
            printAll: false,
            printType
        });
        setShowPrintModal(true);
    };

    const handlePrintAllInvoices = () => {
        if (couponPayments.length > 0) {
            const allIsins = couponPayments.map(payment => ({
                isinId: payment.isinId,
                isinCode: payment.isinNumber,
                caseName: currentActiveIsin?.caseName || ''
            }));

            setPrintData({
                isinId: '',
                isinCode: 'All ISINs',
                caseName: currentActiveIsin?.caseName || '',
                printAll: true,
                allIsins
            });
            setShowPrintModal(true);
        }
    };

    const handleClosePrintModal = () => {
        setShowPrintModal(false);
        setPrintData(null);
    };

    return (
        <Container fluid>
            <Row className="d-flex">
                 <VerticleCollapsContainer 
                    sm={3} 
                    md={3} 
                    xs={3} 
                    titleText="Interest Coupon"
                 >
                    <ISINListWithFilter pageName='interest-coupon' />
                </VerticleCollapsContainer>
                <ContentArea 
                    sm={8}
                    md={8}
                    header={caseId && "Interest Coupon"}
                    subHeader={(caseId && couponPayments[0]) ?
                        `SPV: ${couponPayments[0]?.spvData?.spvtitle || ''}, Compartment: ${couponPayments[0]?.compartmentName || ''}` : 'Loading...' 
                    }
                    toolButtons={
                        caseId && (
                            <>
                                <Dropdown>
                                    <Dropdown.Toggle 
                                        variant="outline-success" 
                                        size="sm"
                                        disabled={loading || couponPayments.length === 0}
                                    >
                                        Print Options
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item 
                                            onClick={handlePrintCurrentIsin('invoice')}
                                            disabled={!currentActiveIsin}
                                        >
                                            Print Current Invoice
                                        </Dropdown.Item>
                                        <Dropdown.Item 
                                            onClick={handlePrintCurrentIsin('coupon')}
                                            disabled={!currentActiveIsin}
                                        >
                                            Print Current Coupon
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item 
                                            onClick={handlePrintAllInvoices}
                                            disabled={couponPayments.length === 0}
                                        >
                                            Print All Invoices
                                        </Dropdown.Item>
                                        {couponPayments.length > 0 && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>Print Specific ISIN Invoice</Dropdown.Header>
                                                {couponPayments.map((payment) => (
                                                    <Dropdown.Item
                                                        key={`invoice-${payment.isinId}`}
                                                        onClick={handlePrintSpecificIsin(
                                                            payment.isinId, 
                                                            payment.isinNumber, 
                                                            currentActiveIsin?.caseName || '',
                                                            'invoice'
                                                        )}
                                                    >
                                                        {payment.isinNumber} (Invoice)
                                                    </Dropdown.Item>
                                                ))}
                                                <Dropdown.Divider />
                                                <Dropdown.Header>Print Specific ISIN Coupon</Dropdown.Header>
                                                {couponPayments.map((payment) => (
                                                    <Dropdown.Item
                                                        key={`coupon-${payment.isinId}`}
                                                        onClick={handlePrintSpecificIsin(
                                                            payment.isinId, 
                                                            payment.isinNumber, 
                                                            currentActiveIsin?.caseName || '',
                                                            'coupon'
                                                        )}
                                                    >
                                                        {payment.isinNumber} (Coupon)
                                                    </Dropdown.Item>
                                                ))}
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        )
                    }                  
                    body={
                        caseId && (
                            <CouponBody 
                                onActiveIsinChange={setCurrentActiveIsin}
                            />
                        )
                    }
                />
            </Row>

            {/* Print Modal */}
            <PrintModal 
                show={showPrintModal} 
                onHide={handleClosePrintModal}
                title={
                    printData?.printAll 
                        ? "All Invoices Print Preview" 
                        : printData?.printType === 'coupon' 
                            ? "Coupon Print Preview" 
                            : "Invoice Print Preview"
                }
                size="xl"
                centered
                printButtonText={
                    printData?.printAll 
                        ? "Print All Invoices" 
                        : printData?.printType === 'coupon' 
                            ? "Print Coupon" 
                            : "Print Invoice"
                }
                multiPageMode={printData?.printAll || false}
            >
                {printData && (
                    printData.printAll && printData.allIsins ? 
                        // Print all invoices - pass as array of children for multi-page mode
                        printData.allIsins.flatMap((isin, index) => ([
                            <InvoicePrint
                                key={`invoice-${index}`}
                                isinId={isin.isinId}
                                isinCode={isin.isinCode}
                                caseName={isin.caseName}
                            />,
                            <InterestCalcOverviewPrint
                                key={`interest-overview-${index}`}
                                isinId={isin.isinId}
                                isinCode={isin.isinCode}
                                caseName={isin.caseName}
                            />
                        ]))
                     : printData.printType === 'coupon' ? (
                        // Print single coupon
                        <CouponPrint
                            isinId={printData.isinId}
                            isinCode={printData.isinCode}
                            caseName={printData.caseName}
                        />
                    ) : (
                        // Print single invoice with interest calculation overview
                        [
                            <InvoicePrint
                                key="invoice-0"
                                isinId={printData.isinId}
                                isinCode={printData.isinCode}
                                caseName={printData.caseName}
                            />,
                            <InterestCalcOverviewPrint
                                key="interest-overview-1"
                                isinId={printData.isinId}
                                isinCode={printData.isinCode}
                                caseName={printData.caseName}
                            />
                        ]
                    )
                )}
            </PrintModal>
        </Container>
    );
};

export default CouponPage;