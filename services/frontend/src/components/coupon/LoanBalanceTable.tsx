import React from 'react';
import { useSelector } from 'react-redux';
import { StyledTable, InfoIcon, EmptyStateText, HelpText } from '../styled/CommonStyled';
import { RootState } from '../../store/store';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoading from '../common/SkeletonLoader';
import { Small } from '../styled/TypographyStyled';
import { currencyUtils, dateUtils } from '../../utils/formatters';

interface LoanBalanceTableProps {
    isinId: string;
    loading?: boolean;
}

const LoanBalanceTable: React.FC<LoanBalanceTableProps> = ({ isinId, loading = false }) => {
    const { theme } = useTheme();
    
    // Get coupon payment data from Redux store
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);
    
    // Find the specific ISIN's loan balance data
    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);
    const loanBalanceData = currentIsinData?.loanBalanceOverview || [];

    const totalAmount = loanBalanceData.reduce((sum, row) => sum + row.amount, 0);

    if (loading) {
        return (
            <div className='table-responsive' style={{ 
                height: '60vh', 
                overflowY: 'auto', 
                border: `1px solid ${theme.border}`
            }}>
                <div className="p-3">
                    <SkeletonLoading rows={1} height={[40]} width={['100%']} />
                    <SkeletonLoading rows={5} height={[35]} width={['100%']} />
                </div>
            </div>
        );
    }

    if (loanBalanceData.length === 0) {
        return (
            <div className='table-responsive' style={{ 
                height: '60vh', 
                overflowY: 'auto', 
                border: `1px solid ${theme.border}`,
            }}>
                <div className="text-center p-5">
                    <InfoIcon size={32} className="mb-3" />
                    <EmptyStateText>No Loan Balance Data Available</EmptyStateText>
                    <HelpText>
                        Loan balance overview data has not been generated for this ISIN yet.
                    </HelpText>
                </div>
            </div>
        );
    }

    return (
        <div className='table-responsive' style={{ 
            height: '60vh', 
            overflowY: 'auto', 
        }}>
            <StyledTable
                bordered
                hover
            >
                <thead className='sticky-tbl-header'>
                    <tr >
                        <th>Load Cell</th>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {loanBalanceData.map((row, idx) => (
                        <tr key={idx}>
                            <td>{row.loanCell}</td>
                            <td>{dateUtils.format(row.date)}</td>
                            <td>{currencyUtils.format(row.amount, { currency: currentIsinData?.currency })}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className='sticky-tbl-footer'>
                    <tr >
                        <td className='fw-bold text-end' colSpan={2}>Total</td>
                        <td className='fw-bold'>{currencyUtils.format(totalAmount, { currency: currentIsinData?.currency })}</td>
                    </tr>
                </tfoot>
            </StyledTable>
        </div>
    );
};

export default LoanBalanceTable;
