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
            logoWidth={paymentData.length === 0 ? '160px' : '150px'}
            logoMargin={paymentData.length === 0 ? '15px 0 0 0' : '0 20px 0 0'}
            fontSize={paymentData.length === 0 ? '12px' : '10px'}
        />
    );

    // Shared SPV and Client Information
    const renderSPVClientInfo = () => (
        <div style={{ marginBottom: '20px', fontSize: '11px' }}>
            {paymentData.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', flex: 1 }}>SPV</div>
                    <div style={{ fontWeight: 'bold', flex: 1, textAlign: 'right' }}>Client</div>
                </div>
            )}
            {paymentData.length === 0 && (
                <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '0 0 15px 0' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>acting as administrator of:</div>
                    <div>{spvData?.spvtitle}</div>
                    <div>{companyData?.companyname ?? ''} {compartmentName ? `(${compartmentName})` : ''}</div>
                    <div>{spvData?.address?.addressline1 ?? ''}</div>
                    <div>{spvData?.address?.addressline2 ?? ''}</div>
                    <div>{spvData?.address?.postalcode ?? ''} {spvData?.address?.city ?? ''}</div>
                    <div>{spvData?.address?.country ?? ''}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'right', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>To:</div>
                    <div>{companyData?.companyname ?? ''}</div>
                    <div>{companyData?.addressByAddressid?.addressline1}</div>
                    <div>{companyData?.addressByAddressid?.addressline2}</div>
                    <div>{companyData?.addressByAddressid?.city}</div>
                    <div>{companyData?.addressByAddressid?.country ?? ''}
                         {companyData?.addressByAddressid?.postalcode ? `, ${companyData?.addressByAddressid?.postalcode}` : '' }</div>
                </div>
            </div>
        </div>
    );

    // Shared bank details section
    const renderBankDetails = () => (
        <div style={{ marginTop: '20px', fontSize: '11px', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '10px' }}>
                Please proceed with the payment to the following account until latest (end date period).
            </div>

            {/* Beneficiary Bank Table */}
            <InlineTable>
                <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '80%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td className="label">Beneficiary Bank</td>
                        <td>{spvData?.paymentdetail?.beneficiarybank}</td>
                    </tr>
                    <tr>
                        <td className="label">SWIFT</td>
                        <td>{spvData?.paymentdetail?.correspondent_swift}</td>
                    </tr>
                    <tr>
                        <td className="label">IBAN</td>
                        <td>{spvData?.paymentdetail?.iban}</td>
                    </tr>
                    <tr>
                        <td className="label">Account Name</td>
                        <td>{spvData?.paymentdetail?.accountname}</td>
                    </tr>
                </tbody>
            </InlineTable>

            {/* Correspondent Bank Table */}
            <InlineTable>
                <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '80%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td className="label">
                            Correspondent Bank <br /><span style={{ fontSize: '10px', fontStyle: 'italic', fontWeight: 'normal' }}>(Swift Field 56a)</span>
                        </td>
                        <td>{spvData?.paymentdetail?.correspondentbank}</td>
                    </tr>
                    <tr>
                        <td className="label">SWIFT</td>
                        <td>{spvData?.paymentdetail?.correspondent_swift}</td>
                    </tr>
                    <tr>
                        <td className="label">ABA</td>
                        <td>{spvData?.paymentdetail?.correspondent_aba}</td>
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

            {renderSPVClientInfo()}

            {/* Interest Payment Invoice Message */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: paymentData.length === 0 ? '15px' : '0px',
                fontSize: '12px'
            }}>
                <div style={{ fontWeight: 'bold' }}>Interest Payment Invoice</div>
                <div style={{ fontWeight: 'bold' }}>{dateUtils.format(new Date().toISOString())}</div>
            </div>

            <LineSeparator />

            {/* Client Message */}
            <div style={{ marginBottom: '20px', marginTop: '20px', fontSize: '11px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: paymentData.length === 0 ? '10px' : '0px' }}>Dear Client,</div>
                <div>Please find below the due amount for the interest payments based on the Loan Agreement dated (setup loan agreement date)</div>
            </div>

            {/* Payment Data Table or Empty State */}
            {paymentData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', border: '1px solid #ccc' }}>
                    No payment data available for this ISIN.
                </div>
            ) : (
                <PrintTable>
                    <thead>
                        <tr>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>#Days</th>
                            <th>Interest (%)</th>
                            <th>Accrued</th>
                            <th>Paid Interest</th>
                            <th>Payment Date</th>
                            <th>Currency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData.map((row) => (
                            <tr key={row.id}>
                                <td className="text-center">{dateUtils.format(row.startDate)}</td>
                                <td className="text-center">{dateUtils.format(row.endDate)}</td>
                                <td className="text-center">{calculateDays(row.startDate, row.endDate)}</td>
                                <td className="text-center">{row.interestRate.toFixed(2)}%</td>
                                <td className="text-right">
                                    {currencyUtils.format(row.amount, { currency: currentIsinData?.currency })}
                                </td>
                                <td className="text-right">
                                    {row.paidInterest > 0
                                        ? currencyUtils.format(row.paidInterest, { currency: currentIsinData?.currency })
                                        : '-'
                                    }
                                </td>
                                <td className="text-center">
                                    {row.paymentDate ? dateUtils.format(row.paymentDate) : '-'}
                                </td>
                                <td className="text-center">{currentIsinData?.currency}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} className="text-right">Total Accrued:</td>
                            <td className="text-right">
                                {currencyUtils.format(totalAccrued, { currency: currentIsinData?.currency })}
                            </td>
                            <td className="text-right">
                                {currencyUtils.format(totalPaidInterest, { currency: currentIsinData?.currency })}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                        <tr className="highlighted-row">
                            <td colSpan={5} className="text-right">Outstanding Interest Payment:</td>
                            <td className="text-right">
                                {currencyUtils.format(outstandingInterest, { currency: currentIsinData?.currency })}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </PrintTable>
            )}

            {renderBankDetails()}

            <PrintFooterCommon
                variant='invoice'
                showDisclaimer={false}
                showSignature={true}
                showContactInfo={true}
            />

            <PrintStyles />
        </PrintContainer>
    );
};

export default InvoicePrint;