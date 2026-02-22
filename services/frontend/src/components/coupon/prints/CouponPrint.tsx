import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { currencyUtils, dateUtils } from '../../../utils/formatters';
import { useTheme } from '../../../context/ThemeContext';
import {
    PrintContainer,
    LineSeparator,
    PrintTable,
    InlineTable,
    PrintStyles
} from '../../styled/PrintStyles';
import PrintHeaderCommon from '../../common/print/PrintHeaderCommon';
interface CouponPrintProps {
    isinId: string;
    isinCode?: string;
    caseName?: string;
}

const CouponPrint: React.FC<CouponPrintProps> = ({ 
    isinId, 
    isinCode = '',
    caseName = ''
}) => {
    const { theme } = useTheme();
    const { couponPayments } = useSelector((state: RootState) => state.couponPayment);
    
    // Find the specific ISIN's payment data
    const currentIsinData = couponPayments.find(payment => payment.isinId === isinId);
    const paymentData = currentIsinData?.paymentOverview || [];
    const spvData = currentIsinData?.spvData;

    // Calculate total amount
    const totalAmount = paymentData.reduce((sum, row) => sum + row.paidInterest, 0);

    // Calculate days between dates
    const calculateDays = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get volume from first payment record (assuming consistent)
    const volume = paymentData.length > 0 ? paymentData[0].amount : 0;
    const startDate = paymentData.length > 0 ? paymentData[0].startDate : '';
    const endDate = paymentData.length > 0 ? paymentData[paymentData.length - 1].endDate : '';
    const couponRate = paymentData.length > 0 ? paymentData[0].interestRate : 0;
    const totalDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;
    const couponPaymentDate = paymentData.length > 0 ? paymentData[paymentData.length - 1].paymentDate : '';

    // Prepare SPV address for header
    const spvAddress = spvData?.address ? {
        type: 'Issuer',
        line1: spvData.address.addressline1 || '',
        line2: spvData.address.addressline2 || '',
        line3: `${spvData.address.city || ''} ${spvData.address.postalcode || ''}`.trim(),
        line4: spvData.address.country || '',
        registrationNumber: '',
        title: spvData.spvtitle || ''
    } : undefined;

    return (
        <PrintContainer>
            {/* Header with SPV Address and Logo */}
            <PrintHeaderCommon address={spvAddress} />

            <LineSeparator />
            
            {/* ISIN Information */}
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                <strong>ISIN:</strong> {isinCode || currentIsinData?.isinNumber || 'N/A'}
            </div>
            
            {/* Coupon Payment Date */}
            <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                <strong>Coupon Payment:</strong> {couponPaymentDate ? dateUtils.format(couponPaymentDate) : dateUtils.format(new Date().toISOString())}
            </div>
            
            {/* Broad Line Separator with Blue Color */}
            <hr style={{ 
                border: 'none', 
                borderTop: `3px solid ${theme.primary}`, 
                margin: '15px 0' 
            }} />
            
            <div style={{ height: '20px' }}></div>
            
            {/* Information Section */}
            {(paymentData.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', border: '1px solid #ccc' }}>
                        No payment data available for this ISIN.
                </div>
            ) : (
                <>
                <div style={{ marginBottom: '30px', fontSize: '12px', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <strong>Relevant Volume:</strong> {currencyUtils.format(volume, { currency: currentIsinData?.currency })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                            <strong>Start Date:</strong> {startDate ? dateUtils.format(startDate) : 'N/A'}
                        </div>
                        <div>
                            <strong>Coupon Rate:</strong> {couponRate.toFixed(2)}%
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                            <strong>End Date:</strong> {endDate ? dateUtils.format(endDate) : 'N/A'}
                        </div>
                        <div>
                            <strong>Day Count Convention:</strong> ACT/360
                        </div>
                    </div>

                    <div>
                        <strong>Days:</strong> {totalDays}
                    </div>
                </div>
                <PrintTable>
                    <thead>
                        <tr>
                            <th>Coupon Payment</th>
                            <th>Date</th>
                            <th>Coupon payment made</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData.map((row, index) => (
                            <tr key={row.id}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">
                                    {row.paymentDate ? dateUtils.format(row.paymentDate) : dateUtils.format(row.endDate)}
                                </td>
                                <td className="text-right">
                                    {row.paidInterest > 0
                                        ? currencyUtils.format(row.paidInterest, { currency: currentIsinData?.currency })
                                        : currencyUtils.format(row.amount, { currency: currentIsinData?.currency })}
                                </td>
                            </tr>
                        ))}
                        <tr className="highlighted-row">
                            <td colSpan={2} className="text-right">
                                Total Amount:
                            </td>
                            <td className="text-right">
                                {currencyUtils.format(
                                    totalAmount > 0 ? totalAmount : paymentData.reduce((sum, row) => sum + row.amount, 0),
                                    { currency: currentIsinData?.currency }
                                )}
                            </td>
                        </tr>
                    </tbody>
                </PrintTable>
                </>
            )}

            <PrintStyles />
        </PrintContainer>
    );
};

export default CouponPrint;