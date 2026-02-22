import React, { useState, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    flexRender,
    SortingState,
    ExpandedState,
} from '@tanstack/react-table';
import { StyledTable, StyledFormControl } from '../../styled/CommonStyled';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Small } from '../../styled/TypographyStyled';
import DatePicker from '../../common/DatePicker';
import FormattedCurrencyInput from '../../common/FormattedCurrencyInput';
import InputWrapper from '../../common/InputWrapper';
import { renderWarningMessage } from '../../common/FormValidation';
import { useSubscriptionTrades } from '../../../hooks/useSubscriptionTrades';
import { SubscriptionTrade } from '../../../services/api/graphQL/subscriptionTrades/types/subscriptionTrades';
import { currencyUtils, dateUtils, percentageUtils } from '../../../utils/formatters';

interface SubscriptionTradeTableProps {
    data: SubscriptionTrade[];
    isLoading?: boolean;
    isEditable?: boolean; // Will be controlled by compartment status
    caseId?: string; // For the hook
    currency: string; // Currency for formatting, default USD
}

const SubscriptionTradeTable: React.FC<SubscriptionTradeTableProps> = ({
    data,
    isLoading = false,
    isEditable = false, // Default to read-only, controlled by case status
    caseId = '',
    currency = 'USD'
}) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, string>>({});
    
    // Local state to track immediate UI updates
    const [localData, setLocalData] = useState<SubscriptionTrade[]>(data);

    // Update local data when data prop changes (from parent/refetch)
    React.useEffect(() => {
        setLocalData(data);
    }, [data]);

    const setFieldLoading = useCallback((field: string, isLoading: boolean) => {
        setLoadingStates(prev => ({
            ...prev,
            [field]: isLoading
        }));
    }, []);

    const setFieldError = useCallback((field: string, error: string | null) => {
        setErrorStates(prev => ({
            ...prev,
            [field]: error || ''
        }));
    }, []);

    // Only use the hook if editable and caseId is provided
    const { handleBlur } = useSubscriptionTrades(
        caseId, 
        '',
        isEditable ? {
            setFieldLoading,
            setFieldError
        } : undefined,
    );

    // Handle both UI update and save on blur
    const handleFieldBlur = useCallback((id: string, field: string, value: any) => {
        // First update local state for immediate UI feedback
        setLocalData(prevData => 
            prevData.map(trade => 
                trade.id === id 
                    ? { ...trade, [field]: value }
                    : trade
            )
        );

        // Then save to backend if editable
        if (isEditable && handleBlur) {
            const fieldName = `${field}-${id}`;
            handleBlur(fieldName, value);
        }
    }, [isEditable, handleBlur]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return dateUtils.format(new Date(dateString));
    };

    const getColumnTitle = (columnId: string) => {
        const titleMap: { [key: string]: string } = {
            'expand': ' ',
            'tradedate': 'Trade Date',
            'notional': 'Notional',
            'issueprice': 'Issue Price',
            'settlementamount': 'Settlement Amount',
            'sales': 'Sales'
        };
        return titleMap[columnId] || columnId;
    };

    // Calculated field functions
    const calculateSettlementAmount = (priceDirty: number, notional: number) => {
        return (priceDirty || 0) * (notional || 0);
    };

    const calculateAdditionalSalesSpread = (reofferPrice: number, priceDirty: number) => {
        return (reofferPrice || 0) > 0 ? (reofferPrice || 0) - (priceDirty || 0) : 0;
    };

    const calculateSalesFeeIssueDate = (salesFeePaidByInves: boolean, salesNotPaidIssueDate: number) => {
        return salesFeePaidByInves === false ? salesNotPaidIssueDate : 0;
    };

    const calculateSalesFeeMaturityDate = (salesFeePaidByInves: boolean, salesNotPaidMaturityDate: number) => {
        return salesFeePaidByInves === false ? salesNotPaidMaturityDate : 0;
    };

    const calculateSalesFeeActual = (salesFee: number, notional: number) => {
        return (salesFee || 0) * (notional || 0);
    };

    const calculateDisagio = (distributionPaidByInvs: boolean, salesFee: number, discount: number) => {
        const salesFeeValue = salesFee || 0;
        const discountValue = discount || 0;
        return distributionPaidByInvs === true ? salesFeeValue - discountValue : -salesFeeValue - discountValue;
    };

    const calculateAgio = () => {
        return 0; // TBD - default 0%
    };

    // Calculate totals for footer using localData
    const totalNotional = localData.reduce((sum, row) => sum + (row.notional || 0), 0);
    const totalSettlementAmount = localData.reduce((sum, row) => {
        const settlementAmount = calculateSettlementAmount(row.price_dirty, row.notional);
        return sum + settlementAmount;
    }, 0);

    const columns = [
        {
            id: 'expand',
            header: '',
            size: 30,
            enableSorting: false,
            cell: ({ row }: any) => (
                <div
                    onClick={() => row.toggleExpanded()}
                    style={{
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '20px',
                        height: '20px',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: row.getIsExpanded() ? '#e9ecef' : 'transparent'
                    }}
                    title={row.getIsExpanded() ? 'Collapse details' : 'Expand details'}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = row.getIsExpanded() ? '#e9ecef' : 'transparent';
                    }}
                >
                    {row.getIsExpanded() ? (
                        <FaChevronDown size={10} color="#495057" />
                    ) : (
                        <FaChevronRight size={10} color="#495057" />
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'tradedate',
            header: 'Trade Date',
            size: 100,
            enableSorting: true,
            cell: ({ row, getValue }: any) => {
                if (isEditable) {
                    return (
                        <DatePicker
                            value={getValue()}
                            onChange={(value) => handleFieldBlur(row.original.id, 'tradedate', value)}
                            disabled={true} // Trade Date is read-only
                        />
                    );
                }
                return <span style={{ fontSize: '0.8rem', color: '#495057' }}>{formatDate(getValue())}</span>;
            },
        },
        {
            accessorKey: 'notional',
            header: 'Notional',
            size: 100,
            enableSorting: true,
            cell: ({ row, getValue }: any) => {
                if (isEditable) {
                    const fieldName = `notional-${row.original.id}`;
                    return (
                        <InputWrapper
                            isLoading={loadingStates[fieldName]}
                            rightIcon={renderWarningMessage(errorStates[fieldName])}
                        >
                            <FormattedCurrencyInput
                                value={getValue()}
                                onChange={() => {}} // Handle on blur only
                                onBlur={(value) => handleFieldBlur(row.original.id, 'notional', value || 0)}
                                currency={currency}
                            />
                        </InputWrapper>
                    );
                }
                return <span style={{ fontSize: '0.8rem', color: '#495057' }}>{currencyUtils.formatWithoutSymbol(getValue() || 0)}</span>;
            },
        },
        {
            accessorKey: 'issueprice',
            header: 'Issue Price',
            size: 120,
            cell: ({ row, getValue }: any) => {
                if (isEditable) {
                    return (
                        <FormattedCurrencyInput
                            value={getValue()}
                            onChange={() => {}} // Handle on blur only
                            onBlur={(value) => {}}
                            currency={currency}
                            disabled={true} // Issue Price is read-only
                        />
                    );
                }
                return <span style={{ fontSize: '0.8rem', color: '#495057' }}>{currencyUtils.formatWithoutSymbol(getValue() || 0)}</span>;
            },
        },
        {
            id: 'settlementamount',
            header: 'Settlement Amount',
            size: 140,
            cell: ({ row }: any) => {
                const settlementAmount = calculateSettlementAmount(row.original.price_dirty, row.original.notional);
                if (isEditable) {
                    return (
                        <FormattedCurrencyInput
                            value={settlementAmount}
                            onChange={() => {}} // Handle on blur only
                            onBlur={(value) => {}}
                            disabled={true} // Always disabled - calculated field
                            currency={currency}
                        />
                    );
                }
                return <span style={{ fontSize: '0.8rem', color: '#495057' }}>{currencyUtils.formatWithoutSymbol(settlementAmount)}</span>;
            },
        },
        {
            accessorKey: 'sales',
            header: 'Sales',
            size: 120,
            enableSorting: true,
            cell: ({ row, getValue }: any) => {
                if (isEditable) {
                    return (
                        <StyledFormControl
                            size="sm"
                            value={getValue() || ''}
                            style={{ fontSize: '0.875rem' }}
                            disabled={true} // Sales field is read-only
                        />
                    );
                }
                return <span style={{ fontSize: '0.8rem', color: '#495057' }}>{getValue() || '-'}</span>;
            },
        },
    ];

    const table = useReactTable({
        data: localData,
        columns,
        state: {
            sorting,
            expanded,
        },
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: () => true,
    });

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <Small>Loading subscription trades...</Small>
            </div>
        );
    }

    return (
        <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{ 
                flex: '1',
                overflowX: 'auto',
                overflowY: 'auto'
            }}>
                <StyledTable 
                    striped 
                    bordered 
                    hover 
                    responsive 
                    style={{ 
                        marginBottom: '0',
                        border: 'none'
                    }}
                >
                <thead style={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 10 
                }}>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id}
                                    style={{ 
                                        minWidth: `${header.getSize()}px`,
                                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                        userSelect: 'none',
                                    }}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                    }}>
                                        <div style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: '1',
                                        }}>
                                            <div style={{ textAlign: 'left', width: '100%' }}>
                                                {getColumnTitle(header.column.id)}
                                            </div>
                                        </div>
                                        
                                        {/* Simple sort indicator */}
                                        {header.column.getCanSort() && (
                                            <div style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                                {{
                                                    asc: '↑',
                                                    desc: '↓',
                                                }[header.column.getIsSorted() as string] ?? '↕'}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <React.Fragment key={row.id}>
                            <tr data-subscription-trade-row={row.original.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={{ padding: '0.375rem 0.5rem' }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                            {row.getIsExpanded() && (
                                <tr>
                                    <td colSpan={table.getAllColumns().length} style={{ 
                                        padding: 0, 
                                        backgroundColor: '#f8f9fa',
                                    }}>
                                        <div style={{ 
                                            padding: '0.5rem 0.375rem',
                                        }}>
                                            <div className="container-fluid">
                                                <div className="row g-3">
                                                    {/* Value Date */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Value Date
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`valuedate-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`valuedate-${row.original.id}`])}
                                                                >
                                                                    <DatePicker
                                                                        value={row.original.valuedate || ''}
                                                                        onChange={(value) => handleFieldBlur(row.original.id, 'valuedate', value)}
                                                                        disableWeekends={true}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {formatDate(row.original.valuedate || '')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Sales Fee */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Sales Fee
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <FormattedCurrencyInput
                                                                    value={row.original.salesfee}
                                                                    onChange={() => {}} // No-op for disabled field
                                                                    currency={currency}
                                                                    disabled={true} // Sales Fee is read-only
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {currencyUtils.formatWithoutSymbol(row.original.salesfee || 0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price Dirty */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Price Dirty
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`price_dirty-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`price_dirty-${row.original.id}`])}
                                                                >
                                                                    <FormattedCurrencyInput
                                                                        value={row.original.price_dirty}
                                                                        onChange={() => {}} // Handle on blur only
                                                                        onBlur={(value) => handleFieldBlur(row.original.id, 'price_dirty', value || 0)}
                                                                        currency={currency}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {currencyUtils.formatWithoutSymbol(row.original.price_dirty || 0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Discount */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Discount
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`discount-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`discount-${row.original.id}`])}
                                                                >
                                                                    <FormattedCurrencyInput
                                                                        value={row.original.discount}
                                                                        onChange={() => {}} // Handle on blur only
                                                                        onBlur={(value) => handleFieldBlur(row.original.id, 'discount', value || 0)}
                                                                        currency={currency}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {currencyUtils.formatWithoutSymbol(row.original.discount || 0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reoffer Price */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Reoffer Price
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`reofferprice-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`reofferprice-${row.original.id}`])}
                                                                >
                                                                    <FormattedCurrencyInput
                                                                        value={row.original.reofferprice}
                                                                        onChange={() => {}} // Handle on blur only
                                                                        onBlur={(value) => handleFieldBlur(row.original.id, 'reofferprice', value || 0)}
                                                                        currency={currency}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {currencyUtils.formatWithoutSymbol(row.original.reofferprice || 0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Counterparty */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Counterparty
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`counterparty-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`counterparty-${row.original.id}`])}
                                                                >
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={row.original.counterparty || ''}
                                                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => 
                                                                            handleFieldBlur(row.original.id, 'counterparty', e.target.value)
                                                                        }
                                                                        style={{ fontSize: '0.875rem' }}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {row.original.counterparty || '-'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Bank/Investor */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Bank/Investor
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`bank_investor-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`bank_investor-${row.original.id}`])}
                                                                >
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={row.original.bank_investor || ''}
                                                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => 
                                                                            handleFieldBlur(row.original.id, 'bank_investor', e.target.value)
                                                                        }
                                                                        style={{ fontSize: '0.875rem' }}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {row.original.bank_investor || '-'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Reference */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Reference
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {isEditable ? (
                                                                <InputWrapper
                                                                    isLoading={loadingStates[`reference-${row.original.id}`]}
                                                                    rightIcon={renderWarningMessage(errorStates[`reference-${row.original.id}`])}
                                                                >
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={row.original.reference || ''}
                                                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => 
                                                                            handleFieldBlur(row.original.id, 'reference', e.target.value)
                                                                        }
                                                                        style={{ fontSize: '0.875rem' }}
                                                                    />
                                                                </InputWrapper>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                    {row.original.reference || '-'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Additional Sales Spread - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Additional Sales Spread
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const spreadValue = calculateAdditionalSalesSpread(row.original.reofferprice, row.original.price_dirty);
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={currencyUtils.formatWithoutSymbol(spreadValue)}
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                        {currencyUtils.formatWithoutSymbol(spreadValue)}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Sales Fee Issue Date - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Sales Fee Issue Date
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const feeIssueDate = calculateSalesFeeIssueDate(row.original.salesfeepaidbyinves, row.original.salesnotpaidissuedate);
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={feeIssueDate ? feeIssueDate : '0%'}
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                        {percentageUtils.format(feeIssueDate)}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Sales Fee Maturity Date - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Sales Fee Maturity Date
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const feeMaturityDate = calculateSalesFeeMaturityDate(row.original.salesfeepaidbyinves, row.original.salesnotpaidmaturitydate);
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={feeMaturityDate ? feeMaturityDate : '0%'}
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                                                                        {percentageUtils.format(feeMaturityDate)}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Sales Fee Actual - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Sales Fee Actual
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const salesFeeActual = calculateSalesFeeActual(row.original.salesfee, row.original.notional);
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={currencyUtils.formatWithoutSymbol(salesFeeActual)}
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                                                        {currencyUtils.formatWithoutSymbol(salesFeeActual)}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Disagio - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Disagio
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const disagio = calculateDisagio(row.original.distributionpaidbyinvs, row.original.salesfee, row.original.discount);
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value={currencyUtils.formatWithoutSymbol(disagio)}
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                                                        {currencyUtils.formatWithoutSymbol(disagio)}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Agio - Calculated */}
                                                    <div className="col-sm-4 col-md-4 col-lg-3">
                                                        <Small style={{ fontWeight: '600', color: '#6c757d' }}>
                                                            Agio
                                                        </Small>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {(() => {
                                                                const agio = calculateAgio();
                                                                return isEditable ? (
                                                                    <StyledFormControl
                                                                        size="sm"
                                                                        value="0%"
                                                                        disabled={true}
                                                                        style={{ 
                                                                            fontSize: '0.875rem',
                                                                            backgroundColor: '#f8f9fa',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontSize: '0.875rem', color: '#495057' }}>
                                                                        {'0%'}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    {localData.length === 0 && (
                        <tr>
                            <td colSpan={table.getAllColumns().length} style={{ 
                                textAlign: 'center', 
                                padding: '1.5rem' 
                            }}>
                                <Small>No subscriptions available.</Small>
                            </td>
                        </tr>
                    )}
                </tbody>
                {/** show footer only when there is data. */
                data && data.length > 0 && (
                <tfoot>
                    <tr>
                        <td>
                            <span  style={{ fontSize: '0.875rem', color: '#495057', fontWeight: 'bold' }}>Totals:</span>
                        </td>
                        <td>
                            {/* Trade Date column - empty */}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.875rem', color: '#495057', fontWeight: 'bold' }}>{currencyUtils.format(totalNotional, { currency })}</span>
                        </td>
                        <td>
                            {/* Issue Price column - empty */}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <span style={{ fontSize: '0.875rem', color: '#495057', fontWeight: 'bold' }}>{currencyUtils.format(totalSettlementAmount, { currency })}</span>
                        </td>
                        <td colSpan={table.getAllColumns().length - 5}>
                            {/* Remaining columns - empty */}
                        </td>
                    </tr>
                </tfoot>
                )}
            </StyledTable>
            </div>
        </div>
    );
};

export default SubscriptionTradeTable;
