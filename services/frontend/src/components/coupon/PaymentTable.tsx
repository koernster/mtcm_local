import React from 'react';
import { useSelector } from 'react-redux';
import { StyledTable, InfoIcon, EmptyStateText, HelpText } from '../styled/CommonStyled';
import FormattedCurrencyInput from '../common/FormattedCurrencyInput';
import { currencyUtils, dateUtils } from '../../utils/formatters';
import { RootState } from '../../store/store';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoading from '../common/SkeletonLoader';
import { Small } from '../styled/TypographyStyled';

interface PaymentTableProps {
    isinId: string;
    loading?: boolean;
    currency?: string;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ isinId, loading = false, currency = 'USD' }) => {
    const { theme } = useTheme();
    
    // Get coupon payment data from Redux store
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);
    
    // Find the specific ISIN's payment data
    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);
    const paymentData = currentIsinData?.paymentOverview || [];

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

    if (loading) {
        return (
            <div className='table-responsive' style={{ 
                height: '50vh', 
                overflowY: 'auto', 
                border: `1px solid ${theme.border}`, 
                borderRadius: theme.borderRadius 
            }}>
                <div className="p-3">
                    <SkeletonLoading rows={1} height={[40]} width={['100%']} />
                    <SkeletonLoading rows={4} height={[35]} width={['100%']} />
                </div>
            </div>
        );
    }

    if (paymentData.length === 0) {
        return (
            <div className='table-responsive' style={{ 
                height: '50vh', 
                overflowY: 'auto', 
                border: `1px solid ${theme.border}`
            }}>
                <div className="text-center p-5">
                    <InfoIcon size={32} className="mb-3" />
                    <EmptyStateText>No Payment Data Available</EmptyStateText>
                    <HelpText>
                        Payment overview data has not been generated for this ISIN yet.
                    </HelpText>
                </div>
            </div>
        );
    }

    return (
        <div className='table-responsive' style={{ 
            height: '50vh', 
            overflowY: 'auto',
        }}>
            <StyledTable
                bordered
                hover
            >
                <thead className='sticky-tbl-header'>
                    <tr>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>#Days</th>
                        <th>Interest (%)</th>
                        <th>Accrued</th>
                        <th>Paid Interest</th>
                        <th>Valuta</th>
                    </tr>
                </thead>
                <tbody>
                    {paymentData.map((row, idx) => (
                        <tr key={row.id}>
                            <td>{dateUtils.format(row.startDate)}</td>
                            <td>{dateUtils.format(row.endDate)}</td>
                            <td>{calculateDays(row.startDate, row.endDate)}</td>
                            <td>{row.interestRate.toFixed(2)}%</td>
                            <td style={{ textAlign: 'right' }}>
                                {currencyUtils.format(row.amount, { currency: currentIsinData?.currency })}
                            </td>
                            <td>
                                {
                                (row.paidInterest != null && row.paidInterest > 0) ? 
                                    (<>
                                        <span>{currencyUtils.format(row.paidInterest, { currency: currentIsinData?.currency })}</span><br />
                                        <Small>{dateUtils.format(row.paymentDate)}</Small>
                                    </>)
                                :(<FormattedCurrencyInput
                                    value={row.paidInterest}
                                    onChange={() => {}} // Read-only for now - can be enhanced later for editing
                                    currency={currentIsinData?.currency}
                                    style={{ width: '120px' }}
                                    min={0}
                                />)
                                }
                            </td>
                            <td>{currentIsinData?.currency}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className='sticky-tbl-footer'>
                    <tr>
                        <td colSpan={4} className='fw-bold text-end'>Total</td>
                        <td className='fw-bold text-end'>
                            {currencyUtils.format(totalAccrued, { currency: currentIsinData?.currency })}
                        </td>
                        <td className='fw-bold text-end'>
                            {currencyUtils.format(totalPaidInterest, { currency: currentIsinData?.currency })}
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan={5} className='fw-bold text-end'>Outstanding Interest Payment</td>
                        <td className='fw-bold text-end'>
                            {currencyUtils.format(outstandingInterest, { currency: currentIsinData?.currency })}
                        </td>
                        <td>&nbsp;</td>
                    </tr>
                </tfoot>
            </StyledTable>
        </div>
    );
};

export default PaymentTable;
