import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { currencyUtils, dateUtils } from '../../../utils/formatters';
import {
    PrintContainer,
    LineSeparator,
    PrintTable,
    InlineTable,
    SummaryBox,
    PrintStyles
} from '../../styled/PrintStyles';
import PrintHeaderCommon from '../../common/print/PrintHeaderCommon';
import PrintFooterCommon from '../../common/print/PrintFooterCommon';

interface InvoicePrintProps {
    isinId: string;
    isinCode?: string;
    caseName?: string;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({
    isinId,
    isinCode = '',
    caseName = ''
}) => {
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);

    // Find the specific ISIN's payment data
    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);
    const paymentData = currentIsinData?.paymentOverview || [];
    const spvData = currentIsinData?.spvData;
    const companyData = currentIsinData?.company;
    const compartmentName = currentIsinData?.compartmentName;

    // Calculate totals
    const totalAccrued = paymentData.reduce((sum, row) => sum + row.amount, 0);
    const totalPaidInterest = paymentData.reduce((sum, row) => sum + row.paidInterest, 0);
    const outstandingInterest = totalAccrued - totalPaidInterest;

    // Calculate days between dates
    const calculateDays = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Shared header component
    const renderHeader = () => (
        <PrintHeaderCommon
            spvData={spvData}
            logoWidth={paymentData.length === 0 ? '160px' : '150px'}
            logoMargin={paymentData.length === 0 ? '15px 0 0 0' : '0 20px 0 0'}
            fontSize={paymentData.length === 0 ? '12px' : '10px'}
        />
    );

    const renderBillToAddress = () => (
        <div style={{ marginBottom: '20px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, textAlign: 'left', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Bill To:</div>
                    <div>{companyData?.companyname ?? ''}</div>
                    {/* <div>{companyData?.companyid ? 'CompanyID: ' + companyData?.companyid : ''}</div> */}
                    <div>{companyData?.addressByAddressid?.addressline1}</div>
                    <div>{companyData?.addressByAddressid?.addressline2}</div>
                    <div>{companyData?.addressByAddressid?.city}</div>
                    <div>{companyData?.addressByAddressid?.country ?? ''}
                        {companyData?.addressByAddressid?.postalcode ? `, ${companyData?.addressByAddressid?.postalcode}` : ''}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'right', lineHeight: '1.4' }}>
                    <div><b>Invoice Date:</b> {dateUtils.format(new Date().toISOString())}</div>
                    <div><b>Terms:</b> Due on Recepit</div>
                    <div><b>Due Date:</b> {dateUtils.format(new Date().toISOString())}</div>
                </div>
            </div>
        </div>
    );

    // Shared bank details section
    const renderBankDetails = () => (
        <div style={{ marginTop: '20px', fontSize: '11px', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '10px' }}>
                Please proceed with the payment <b>{currentIsinData?.currency}</b> to the following account until latest (end date period).
            </div>

            {/* Bank Details Table */}
            <InlineTable>
                <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '80%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td className="label">Bank Name</td>
                        <td>{spvData?.paymentdetail?.bankname}</td>
                    </tr>
                    <tr>
                        <td className="label">Address</td>
                        <td>{spvData?.paymentdetail?.address}</td>
                    </tr>
                    <tr>
                        <td className="label">Beneficiary</td>
                        <td>{spvData?.paymentdetail?.beneficiary}</td>
                    </tr>
                    <tr>
                        <td className="label">{currentIsinData?.currency} IBAN</td>
                        <td>{spvData?.paymentdetail?.iban}</td>
                    </tr>
                    <tr>
                        <td className="label">SWIFT</td>
                        <td>{spvData?.paymentdetail?.swift}</td>
                    </tr>
                    <tr>
                        <td className="label">BIC Intermediary</td>
                        <td>{spvData?.paymentdetail?.bicintermediary}</td>
                    </tr>
                </tbody>
            </InlineTable>
        </div>
    );

    return (
        <PrintContainer>
            <h4 style={{
                textAlign: 'left',
                margin: paymentData.length === 0 ? '0 0 15px 0' : '0 0 10px 0',
                fontSize: paymentData.length === 0 ? '14px' : '12px',
                fontWeight: 'bold'
            }}>
                INVOICE
            </h4>
            <LineSeparator />

            {renderHeader()}

            {renderBillToAddress()}

            <LineSeparator />

            {/* Client Message */}
            <div style={{ marginBottom: '20px', marginTop: '20px', fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: paymentData.length === 0 ? '10px' : '0px' }}>Dear {companyData?.companyname ?? ''},</div>
                <div>Please find the due interest payments amount for <b>(Compartment Name: {currentIsinData?.compartmentName})</b> based on the Loan Agreement dated (setup loan agreement date).</div>
            </div>

            {/* Payment Data Table or Empty State */}
            {paymentData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', border: '1px solid #ccc' }}>
                    No payment data available for this ISIN.
                </div>
            ) : (
                <>
                    <PrintTable>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>#</th>
                                <th style={{ width: '50%' }}>Item &amp; Description</th>
                                <th style={{ width: '10%' }}>Qty</th>
                                <th style={{ width: '15%' }}>Rate</th>
                                <th style={{ width: '20%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData.map((row, index) => (
                                <tr key={row.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        Interest Payment ({currentIsinData?.isinNumber || isinCode || 'N/A'})
                                        <br />
                                        <span style={{ fontSize: '10px', color: '#666' }}>
                                            {dateUtils.format(row.startDate)} - {dateUtils.format(row.endDate)}
                                        </span>
                                    </td>
                                    <td className="text-center">{calculateDays(row.startDate, row.endDate)}</td>
                                    <td className="text-center">{row.interestRate.toFixed(2)}%</td>
                                    <td className="text-right">
                                        {currencyUtils.format(row.amount, { currency: currentIsinData?.currency })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} className="text-right">SubTotal:</td>
                                <td className="text-right">
                                    {currencyUtils.format(totalAccrued, { currency: currentIsinData?.currency })}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="text-right">*VAT out of scope (0%):</td>
                                <td className="text-right">
                                    {currencyUtils.format(0, { currency: currentIsinData?.currency })}
                                </td>
                            </tr>
                            <tr className="highlighted-row">
                                <td colSpan={4} className="text-right" style={{ fontWeight: 'bold' }}>
                                    Total {currentIsinData?.currency}:
                                </td>
                                <td className="text-right" style={{ fontWeight: 'bold' }}>
                                    {currencyUtils.format(totalAccrued, { currency: currentIsinData?.currency })}
                                </td>
                            </tr>
                        </tfoot>
                    </PrintTable>
                    <div style={{ marginBottom: '10px', marginTop: '5px', fontSize: '9px' }}>
                        *According to §44 Abs. 1, d) Luxembourgish VAT regulation there is no obligation to expel VAT.
                    </div>
                </>
            )}

            {renderBankDetails()}

            <PrintFooterCommon
                variant='invoice'
                showDisclaimer={false}
                showSignature={true}
                showContactInfo={true}
                spvData={spvData}
            />

            <PrintStyles />
        </PrintContainer >
    );
};

export default InvoicePrint;