import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { currencyUtils, dateUtils, percentageUtils } from '../../../utils/formatters';
import { useTheme } from '../../../context/ThemeContext';
import {
    PrintContainer,
    LineSeparator,
    PrintTable,
    PrintStyles
} from '../../styled/PrintStyles';
import PrintHeaderCommon from '../../common/print/PrintHeaderCommon';
import PrintFooterCommon from '../../common/print/PrintFooterCommon';

interface InterestCalcOverviewPrintProps {
    isinId: string;
    isinCode?: string;
    caseName?: string;
}

const InterestCalcOverviewPrint: React.FC<InterestCalcOverviewPrintProps> = ({
    isinId,
    isinCode = '',
    caseName = ''
}) => {
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);

    // Find the specific ISIN's data
    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);
    const loanBalanceData = currentIsinData?.loanBalanceOverview || [];

    // Calculate total loan balance
    const totalLoanBalance = loanBalanceData.reduce((sum, row) => sum + row.amount, 0);

    // Dummy data for Overview table (as specified in requirements)
    const overviewData = {
        isin: isinCode || currentIsinData?.isinNumber || 'LU0123456789',
        issueDate: '2024-01-15',
        maturityDate: '2029-01-15',
        issuePrice: '100.00',
        redemptionPrice: '100.00',
        couponInterest: '3.50',
        frequency: 'Semi-Annual',
        dayCount: '30/360'
    };

    return (
        <PrintContainer>
            {/* Header with Logo only */}
            <PrintHeaderCommon spvData={currentIsinData?.spvData} />

            <LineSeparator />

            {/* Title and Case Information */}
            <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
                Overview of Interest Calculation
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '15px' }}>
                <div>
                    <strong>SPV:</strong> {currentIsinData?.spvData?.spvtitle || 'N/A'}
                </div>
                <div>
                    <strong>Compartment:</strong> {currentIsinData?.compartmentName || caseName || 'N/A'}
                </div>
            </div>

            <LineSeparator />

            <div style={{ height: '10px' }}></div>

            {/* Side by side tables */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {/* Overview Table - Left Side */}
                <div style={{ flex: '1' }}>
                    <PrintTable>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}></th>
                                <th style={{ width: '30%' }}>Security</th>
                                <th style={{ width: '30%' }}>Loan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>ISIN:</td>
                                <td className="text-center">{currentIsinData?.isinNumber}</td>
                                <td className="text-center">{currentIsinData?.isinNumber}</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Issue Date:</td>
                                <td className="text-center">{dateUtils.format(currentIsinData?.issueDate)}</td>
                                <td className="text-center">{dateUtils.format(currentIsinData?.issueDate)}</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Maturity Date:</td>
                                <td className="text-center">{dateUtils.format(currentIsinData?.maturityDate)}</td>
                                <td className="text-center">{dateUtils.format(currentIsinData?.maturityDate)}</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Issue Price:</td>
                                <td className="text-center">{currencyUtils.format(currentIsinData?.issuePrice)}</td>
                                <td className="text-center">{currencyUtils.format(currentIsinData?.issuePrice)}</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Redemption Price:</td>
                                <td className="text-center">{''}%</td>
                                <td className="text-center">{''}%</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Coupon/Interest:</td>
                                <td className="text-center">{''}%</td>
                                <td className="text-center">
                                    <ul>
                                        {couponPayments.map((item) => (
                                            <li key={item.isinId}>
                                                {item.isinNumber}: {percentageUtils.format(item.couponInterest?.interestRate || 0)}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Frequency:</td>
                                <td className="text-center">{currentIsinData?.couponFrequency}</td>
                                <td className="text-center">{currentIsinData?.couponFrequency}</td>
                            </tr>
                            <tr>
                                <td className="label" style={{ fontWeight: 'bold' }}>Day Count:</td>
                                <td className="text-center">{360}</td>
                                <td className="text-center">{360}</td>
                            </tr>
                        </tbody>
                    </PrintTable>
                </div>

                {/* Trade History Table - Right Side */}
                <div style={{ flex: '1' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                        Trade History
                    </h4>
                    <PrintTable>
                        <thead>
                            <tr>
                                <th>Loan Cell</th>
                                <th>Date</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loanBalanceData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center">
                                        No trade history data available
                                    </td>
                                </tr>
                            ) : (
                                loanBalanceData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{row.loanCell}</td>
                                        <td className="text-center">
                                            {dateUtils.format(row.date)}
                                        </td>
                                        <td className="text-right">
                                            {currencyUtils.format(row.amount, {
                                                currency: currentIsinData?.currency
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {loanBalanceData.length > 0 && (
                            <tfoot>
                                <tr className="highlighted-row">
                                    <td colSpan={2} className="text-right" style={{ fontWeight: 'bold' }}>
                                        Current Loan Balance:
                                    </td>
                                    <td className="text-right" style={{ fontWeight: 'bold' }}>
                                        {currencyUtils.format(totalLoanBalance, {
                                            currency: currentIsinData?.currency
                                        })}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </PrintTable>
                </div>
            </div>

            {/* Payment Overview Table */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                    Payment Overview
                </h4>

                {currentIsinData?.paymentOverview && currentIsinData.paymentOverview.length > 0 ? (
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
                            {currentIsinData.paymentOverview.map((row) => {
                                // Calculate days between dates
                                const calculateDays = (startDate: string, endDate: string): number => {
                                    const start = new Date(startDate);
                                    const end = new Date(endDate);
                                    const diffTime = Math.abs(end.getTime() - start.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays;
                                };

                                return (
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
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4} className="text-right">Total Accrued:</td>
                                <td className="text-right">
                                    {currencyUtils.format(
                                        currentIsinData.paymentOverview.reduce((sum, row) => sum + row.amount, 0),
                                        { currency: currentIsinData?.currency }
                                    )}
                                </td>
                                <td className="text-right">
                                    {currencyUtils.format(
                                        currentIsinData.paymentOverview.reduce((sum, row) => sum + row.paidInterest, 0),
                                        { currency: currentIsinData?.currency }
                                    )}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                            <tr className="highlighted-row">
                                <td colSpan={5} className="text-right">Outstanding Interest Payment:</td>
                                <td className="text-right">
                                    {currencyUtils.format(
                                        currentIsinData.paymentOverview.reduce((sum, row) => sum + row.amount, 0) -
                                        currentIsinData.paymentOverview.reduce((sum, row) => sum + row.paidInterest, 0),
                                        { currency: currentIsinData?.currency }
                                    )}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </PrintTable>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', border: '1px solid #ccc' }}>
                        No payment data available for this ISIN.
                    </div>
                )}
            </div>

            {/* Footer */}
            <PrintFooterCommon
                showDisclaimer={true}
                showSignature={false}
                showContactInfo={true}
                spvData={currentIsinData?.spvData}
            />

            <PrintStyles />
        </PrintContainer>
    );
};

export default InterestCalcOverviewPrint;