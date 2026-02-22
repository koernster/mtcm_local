import { createColumnHelper } from '@tanstack/react-table';
import { BuySellTransaction } from '../../store/slices/buySellSlice';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { currencyUtils, percentageUtils, dateUtils } from '../../utils/formatters';
import DatePicker from '../common/DatePicker';
import FormattedCurrencyInput from '../common/FormattedCurrencyInput';
import PercentageInput from '../common/PercentageInput';
import { Form } from 'react-bootstrap';
import { CouponTypes } from '../../types/CouponTypes';

const columnHelper = createColumnHelper<BuySellTransaction>();

export const createTransactionColumns = (
    selectedIsin: any,
    handleFieldChange: (id: string, field: keyof BuySellTransaction, value: any) => void,
    handleFieldBlur: (id: string, field: keyof BuySellTransaction) => void,
    handleTabOnLastField: (e: React.KeyboardEvent<HTMLElement>, transactionId: string) => void,
    newRowId?: string
) => [
    columnHelper.display({
        id: 'expand',
        header: '',
        size: 30,
        cell: ({ row }) => (
            <div
                onClick={() => row.toggleExpanded()}
                style={{
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
                    height: '100%'
                }}
            >
                {row.getIsExpanded() ? (
                    <FaChevronDown size={10} color="#495057" />
                ) : (
                    <FaChevronRight size={10} color="#495057" />
                )}
            </div>
        ),
    }),
    columnHelper.accessor('tradetypeName', {
        header: 'B/S',
        size: 20,
        cell: ({ row, getValue }) => {
            const type = getValue() as 'Buy' | 'Sell';
            const isNewTransaction = row.original.id === newRowId;
            
            if (isNewTransaction) {
                return (
                    <Form.Select
                        size="sm"
                        value={type || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange(row.original.id, 'tradetypeName', e.target.value)}
                        style={{ fontSize: '11px' }}
                    >
                        <option value="">Select</option>
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                    </Form.Select>
                );
            }

            return (
                <span style={{ 
                    color: type === 'Buy' ? 'var(--bs-primary)' : 'var(--bs-danger)',
                    fontWeight: '500'
                }}>
                    {type}
                </span>
            );
        },
    }),
    columnHelper.accessor('tradedate', {
        header: 'Trade Date',
        size: 70,
        cell: ({ row, getValue }) => {
            const isNewTransaction = row.original.id === newRowId;
            return isNewTransaction ? (
                <DatePicker
                    value={getValue()}
                    onChange={(value) => handleFieldChange(row.original.id, 'tradedate', value)}
                    onBlur={() => handleFieldBlur(row.original.id, 'tradedate')}
                    disableWeekends={true}
                />
            ) : (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {dateUtils.format(getValue())}
                </span>
            );
        },
    }),
    columnHelper.accessor('valuedate', {
        header: 'Value Date',
        size: 70,
        cell: ({ row, getValue }) => {
            const isNewTransaction = row.original.id === newRowId;
            return isNewTransaction ? (
                <DatePicker
                    value={getValue()}
                    onChange={(value) => handleFieldChange(row.original.id, 'valuedate', value)}
                    onBlur={() => handleFieldBlur(row.original.id, 'valuedate')}
                    disableWeekends={true}
                />
            ) : (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {dateUtils.format(getValue())}
                </span>
            );
        },
    }),
    columnHelper.accessor('notional', {
        header: 'Notional',
        size: 80,
        cell: ({ row, getValue }) => {
            const isNewTransaction = row.original.id === newRowId;
            
            return isNewTransaction ? (
                <FormattedCurrencyInput
                    value={getValue() as number}
                    onChange={() => {}} // No-op: let component handle internal state
                    onBlur={(value) => {
                        handleFieldChange(row.original.id, 'notional', value);
                        handleFieldBlur(row.original.id, 'notional');
                    }}
                    currency={selectedIsin?.currencyShortName || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF'}
                    size="sm"
                    style={{ fontSize: '11px' }}
                />
            ) : (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {currencyUtils.formatWithoutSymbol(getValue() || 0, {
                        currency: selectedIsin?.currencyShortName || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF',
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                    })}
                </span>
            );
        },
    }),
    // Conditional Interest Rate column - only show for FIXED coupon types
    ...(selectedIsin?.couponTypeId === CouponTypes.FLOATING ? [
        columnHelper.accessor('interestRate', {
            id: 'interestRate',
            header: 'Coupon Rate',
            size: 40,
            cell: ({ row, getValue }) => {
                const interestRate = getValue();
                return (
                    <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                        {percentageUtils.format(interestRate || 0)}
                    </span>
                );
            },
        })
    ] : []),
    columnHelper.accessor('priceClean', {
        header: 'Price (Clean)',
        size: 20,
        cell: ({ row, getValue }) => {
            return (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {percentageUtils.format(getValue())}
                </span>
            );
        },
    }),
    columnHelper.accessor('price_dirty', {
        header: 'Price (Dirty)',
        size: 30,
        cell: ({ row, getValue }) => {
            return (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {percentageUtils.format(getValue())}
                </span>
            );
        },
    }),
    columnHelper.accessor('settlementAmount', {
        header: 'Settlement Amount',
        size: 30,
        cell: ({ row, getValue }) => (
            <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                {currencyUtils.formatWithoutSymbol(getValue() || 0, {
                    currency: selectedIsin?.currencyShortName || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF'
                })}
            </span>
        ),
    }),
    columnHelper.accessor('daysAccrued', {
        header: 'Days Accrued',
        size: 20,
        cell: ({ row, getValue }) => {
            const daysAccrued = getValue();
            
            return (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {daysAccrued || 0}
                </span>
            );
        },
    }),
    columnHelper.accessor('accruedCurrency', {
        header: 'Accrued',
        size: 30,
        cell: ({ row, getValue }) => {
            const accruedAmount = getValue();
            
            return (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {currencyUtils.formatWithoutSymbol(accruedAmount || 0, {
                        currency: selectedIsin?.currencyShortName || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF'
                    })}
                </span>
            );
        },
    }),
    columnHelper.accessor('tranfee', {
        header: 'Fee %',
        size: 20,
        cell: ({ row, getValue }) => {
            const isNewTransaction = row.original.id === newRowId;
            return isNewTransaction ? (
                <PercentageInput
                    value={getValue()}
                    onChange={() => {}} // No-op: let component handle internal state
                    onBlur={(value) => {
                        handleFieldChange(row.original.id, 'tranfee', value);
                        handleFieldBlur(row.original.id, 'tranfee');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                            handleTabOnLastField(e, row.original.id);
                        }
                    }}
                />
            ) : (
                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                    {percentageUtils.format(getValue())}
                </span>
            );
        },
    }),
    columnHelper.accessor('transactionFeeAmount', {
        header: 'Fee Amount',
        size: 30,
        cell: ({ row, getValue }) => (
            <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                {currencyUtils.formatWithoutSymbol(getValue() || 0, {
                    currency: selectedIsin?.currencyShortName || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF',
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                })}
            </span>
        ),
    }),
];