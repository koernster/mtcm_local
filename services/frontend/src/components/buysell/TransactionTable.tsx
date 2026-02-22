import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    flexRender,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
    ExpandedState,
} from '@tanstack/react-table';
import { FaSave, FaTrash, FaFilter } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import { StyledTable, StyledFormControl, StyledContextMenu, StyledContextMenuItem, StyledContextMenuDivider } from '../styled/CommonStyled';
import { Small } from '../styled/TypographyStyled';
import { BuySellTransaction } from '../../store/slices/buySellSlice';
import FormulaPopover from '../common/FormulaPopover';
import { dateUtils } from '../../utils/formatters';

interface TransactionTableProps {
    data: BuySellTransaction[];
    columns: any[];
    sorting: SortingState;
    setSorting: OnChangeFn<SortingState>;
    columnFilters: ColumnFiltersState;
    setColumnFilters: OnChangeFn<ColumnFiltersState>;
    isReadonly?: boolean;
    newRowId?: string;
    expandedRowId?: string;
    onFieldChange: (id: string, field: keyof BuySellTransaction, value: any) => void;
    onSaveTransaction: (transactionId: string) => void;
    onDeleteTransaction: (transactionId: string) => void;
    canDeleteTransaction: (transaction: BuySellTransaction) => boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
    data,
    columns,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    isReadonly = false,
    newRowId,
    expandedRowId,
    onFieldChange,
    onSaveTransaction,
    onDeleteTransaction,
    canDeleteTransaction
}) => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [savingTransaction, setSavingTransaction] = useState<string | null>(null);
    const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
    
    // Auto-expand the specified row
    useEffect(() => {
        if (expandedRowId && data.length > 0) {
            // Find the row index for the specified transaction ID
            const rowIndex = data.findIndex(transaction => transaction.id === expandedRowId);
            if (rowIndex !== -1) {
                setExpanded({ [rowIndex]: true });
            }
        }
    }, [expandedRowId, data]);
    
    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveContextMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            expanded,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: () => true,
    });
    
    const handleContextMenuClick = (e: React.MouseEvent, headerId: string) => {
        e.stopPropagation();
        setActiveContextMenu(activeContextMenu === headerId ? null : headerId);
    };

    const handleSortClick = (column: any, direction: 'asc' | 'desc') => {
        column.toggleSorting(direction === 'desc');
        setActiveContextMenu(null);
    };

    const getFormulaPropsFromHeader = (header: any) => {
        // Define formula data for columns that have formulas
        const formulaMap: { [key: string]: { title: string, formula: string, description: string, variables?: any } } = {
            'priceDirty': {
                title: 'Dirty Price',
                formula: 'Clean Price + Accrued Interest',
                description: 'The total price of the bond including accrued interest from the last coupon payment date to the settlement date.',
                variables: {
                    'Clean Price': 'Base bond price (typically 100%)',
                    'Accrued Interest': 'Interest accumulated since last coupon payment',
                    'Dirty Price': 'Total price paid by buyer'
                }
            },
            'daysAccrued': {
                title: 'Days Accrued',
                formula: 'Settlement Date - Last Coupon Date',
                description: 'The number of days from the last coupon payment date to the settlement date, used to calculate accrued interest.'
            },
            'accruedCurrency': {
                title: 'Accrued Interest',
                formula: '(Notional × Coupon Rate × Days Accrued) / 365',
                description: 'The amount of interest that has accumulated on the bond since the last coupon payment.'
            }
        };
        
        return formulaMap[header.column.id];
    };
    const getColumnTitle = (columnId: string) => {
        const titleMap: { [key: string]: string } = {
            'expand': '',
            'transactionType': 'Buy/Sell',
            'tradeDate': 'Trade Date',
            'valueDate': 'Value Date',
            'notionalCurrency': 'Notional',
            'priceClean': 'Price (Clean)',
            'priceDirty': 'Price (Dirty)',
            'settlementAmount': 'Settlement',
            'daysAccrued': 'Days Accr.',
            'accruedCurrency': 'Accr. (CHF)',
            'tranfee': 'Fee %',
            'transactionFeeAmount': 'Fee (CHF)'
        };
        return titleMap[columnId] || columnId;
    };

    const renderContextMenu = (header: any) => {
        if (activeContextMenu !== header.id) return null;

        // Check if this column has a formula
        const formulaProps = getFormulaPropsFromHeader(header);
        const hasFormula = !!formulaProps;
        
        // Special handling for Buy/Sell column
        const isBuySellColumn = header.column.id === 'transactionType';
        const isDateColumn = header.column.id === 'tradeDate' || header.column.id === 'valueDate';

        const sortColumnNames = ["Lowest on Top", "Highest on Top"];
        if(isBuySellColumn){
            sortColumnNames[0] = "Buy on Top";
            sortColumnNames[1] = "Sell on Top";
        }else if (isDateColumn){
            sortColumnNames[0] = "Latest on Top";
            sortColumnNames[1] = "Earliest on Top";
        }

        return (
            <StyledContextMenu style={{
                top: '100%',
                right: '0'
            }}>
                <StyledContextMenuItem onClick={() => handleSortClick(header.column, 'asc')}>
                    {sortColumnNames[0]}
                </StyledContextMenuItem>
                <StyledContextMenuItem onClick={() => handleSortClick(header.column, 'desc')}>
                    {sortColumnNames[1]}
                </StyledContextMenuItem>
                {hasFormula && formulaProps && (
                    <>
                        <StyledContextMenuDivider />
                        <div style={{
                            padding: '0.5rem 0.75rem',
                            cursor: 'default'
                        }}>
                            <FormulaPopover
                                title={formulaProps.title}
                                formula={formulaProps.formula}
                                description={formulaProps.description}
                                variables={formulaProps.variables}
                                trigger={['click']}
                                placement="left"
                            >
                                <div style={{ width: '100%', color: 'inherit' }}>
                                    Formula
                                </div>
                            </FormulaPopover>
                        </div>
                    </>
                )}
            </StyledContextMenu>
        );
    };

    return (
        <div style={{ 
            overflowX: 'auto', // Allow horizontal scroll if needed
            height: 'calc(100vh - 280px)', // Use full viewport height minus header/nav/card space
            minHeight: '400px', // Minimum height for small screens
            overflowY: 'auto'
        }}>
            <StyledTable 
                striped 
                bordered 
                hover 
                responsive 
                style={{ 
                    marginBottom: '0'
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
                                        cursor: 'default',
                                        userSelect: 'none',                                        
                                        position: 'relative'
                                    }}
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
                                            {/* Display simple text title, no formula icons */}
                                            <div style={{ textAlign: 'left', width: '100%' }}>
                                                {typeof header.column.columnDef.header === 'string' 
                                                    ? header.column.columnDef.header.split(' ').map((word, index) => (
                                                        <div key={`${header.id}-word-${index}`}>{word}</div>
                                                      ))
                                                    : typeof header.column.columnDef.header === 'function'
                                                    ? getColumnTitle(header.column.id).split(' ').map((word, index) => (
                                                        <div key={`${header.id}-title-${index}`}>{word}</div>
                                                      ))
                                                    : header.column.columnDef.header
                                                }
                                            </div>
                                        </div>

                                        {/* Filter/Context Menu Icon - Moved to right and made smaller */}
                                        {header.column.id !== 'expand' && ( // Remove filter from expand column
                                            <div 
                                                style={{
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    borderRadius: '3px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: activeContextMenu === header.id ? '#e9ecef' : 'transparent',
                                                    transition: 'background-color 0.15s ease'
                                                }}
                                                onClick={(e) => handleContextMenuClick(e, header.id)}
                                                onMouseEnter={(e) => {
                                                    if (activeContextMenu !== header.id) {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeContextMenu !== header.id) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                <FaFilter size={10} color="#6c757d" />
                                                {renderContextMenu(header)}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        const isNewRow = row.original.id === newRowId;
                        const shouldHideRow = isReadonly && !isNewRow;
                        
                        // Hide existing rows when adding new - only show the new editable row
                        if (shouldHideRow) return null;
                        
                        return (
                            <React.Fragment key={row.id}>
                                <tr 
                                    data-transaction-row={row.original.id}
                                    style={{
                                        backgroundColor: isNewRow ? '#e3f2fd' : 'inherit',
                                        position: isNewRow ? 'sticky' : 'static',
                                        top: isNewRow ? table.getHeaderGroups().length * 50 : 'auto',
                                        zIndex: isNewRow ? 5 : 'auto'
                                    }}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} style={{ padding: '0.375rem 0.5rem' }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                                {row.getIsExpanded() && (
                                    <tr>
                                        <td colSpan={table.getAllColumns().length} style={{ padding: 0, backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                                            <div style={{ padding: '0.5rem 0.375rem', borderLeft: '3px solid #007bff' }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {/* Counterparty */}
                                                    <div style={{ minWidth: '140px' }}>
                                                        <label style={{ 
                                                            display: 'block', 
                                                            marginBottom: '0.2rem', 
                                                            fontWeight: '600', 
                                                            fontSize: '0.7rem',
                                                            color: '#495057'
                                                        }}>
                                                            Counterparty
                                                        </label>
                                                        {row.original.id === newRowId ? (
                                                            <StyledFormControl
                                                                type="text"
                                                                value={row.original.counterparty || ''}
                                                                onChange={(e) => onFieldChange(row.original.id, 'counterparty', e.target.value)}
                                                                placeholder="Enter counterparty"
                                                                maxLength={20}
                                                                style={{ fontSize: '0.7rem', borderRadius: '3px', padding: '0.2rem 0.3rem', height: '26px', width: '100%' }}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '0.75rem', color: '#333' }}>
                                                                {row.original.counterparty || '-'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bank/Investor */}
                                                    <div style={{ minWidth: '140px' }}>
                                                        <label style={{ 
                                                            display: 'block', 
                                                            marginBottom: '0.2rem', 
                                                            fontWeight: '600', 
                                                            fontSize: '0.7rem',
                                                            color: '#495057'
                                                        }}>
                                                            Bank/Investor
                                                        </label>
                                                        {row.original.id === newRowId ? (
                                                            <StyledFormControl
                                                                type="text"
                                                                value={row.original.bank_investor || ''}
                                                                onChange={(e) => onFieldChange(row.original.id, 'bank_investor', e.target.value)}
                                                                placeholder="Enter bank/investor"
                                                                maxLength={20}
                                                                style={{ fontSize: '0.7rem', borderRadius: '3px', padding: '0.2rem 0.3rem', height: '26px', width: '100%' }}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '0.75rem', color: '#333' }}>
                                                                {row.original.bank_investor || '-'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Reference */}
                                                    <div style={{ minWidth: '120px' }}>
                                                        <label style={{ 
                                                            display: 'block', 
                                                            marginBottom: '0.2rem', 
                                                            fontWeight: '600', 
                                                            fontSize: '0.7rem',
                                                            color: '#495057'
                                                        }}>
                                                            Reference
                                                        </label>
                                                        {row.original.id === newRowId ? (
                                                            <StyledFormControl
                                                                type="text"
                                                                value={row.original.reference || ''}
                                                                onChange={(e) => onFieldChange(row.original.id, 'reference', e.target.value)}
                                                                placeholder="Enter reference"
                                                                maxLength={15}
                                                                style={{ fontSize: '0.7rem', borderRadius: '3px', padding: '0.2rem 0.3rem', height: '26px', width: '100%' }}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '0.75rem', color: '#333' }}>
                                                                {row.original.reference || '-'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Sales */}
                                                    <div style={{ minWidth: '120px' }}>
                                                        <label style={{ 
                                                            display: 'block', 
                                                            marginBottom: '0.2rem', 
                                                            fontWeight: '600', 
                                                            fontSize: '0.7rem',
                                                            color: '#495057'
                                                        }}>
                                                            Sales
                                                        </label>
                                                        {row.original.id === newRowId ? (
                                                            <StyledFormControl
                                                                type="text"
                                                                value={row.original.sales || ''}
                                                                onChange={(e) => onFieldChange(row.original.id, 'sales', e.target.value)}
                                                                placeholder="Enter sales"
                                                                maxLength={15}
                                                                style={{ fontSize: '0.7rem', borderRadius: '3px', padding: '0.2rem 0.3rem', height: '26px', width: '100%' }}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '0.75rem', color: '#333' }}>
                                                                {row.original.sales || '-'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons - Save (new rows only) and Delete (existing rows) */}
                                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'end', gap: '0.5rem', height: '100%', paddingBottom: '2px' }}>
                                                        {/* Save Button - Only for new rows being created */}
                                                        {row.original.id === newRowId && (
                                                            <Button 
                                                                variant="success" 
                                                                size="sm"
                                                                onClick={async () => {
                                                                    setSavingTransaction(row.original.id);
                                                                    // Add a small delay to show loading state
                                                                    setTimeout(() => {
                                                                        onSaveTransaction(row.original.id);
                                                                        setSavingTransaction(null);
                                                                    }, 500);
                                                                }}
                                                                disabled={savingTransaction === row.original.id}
                                                                style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    padding: '0.25rem 0.5rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    height: '26px'
                                                                }}
                                                            >
                                                                <FaSave size={10} />
                                                                {savingTransaction === row.original.id ? 'Saving...' : 'Save'}
                                                            </Button>
                                                        )}

                                                        {/* Delete Button - Only for existing transactions within 24h window */}
                                                        {row.original.id !== newRowId && (
                                                            <Button 
                                                                variant={canDeleteTransaction(row.original) ? "outline-danger" : "outline-secondary"}
                                                                size="sm"
                                                                onClick={() => onDeleteTransaction(row.original.id)}
                                                                disabled={!canDeleteTransaction(row.original)}
                                                                title={
                                                                    canDeleteTransaction(row.original) 
                                                                        ? "Delete transaction" 
                                                                        : "Cannot delete: 24-hour deletion window has passed"
                                                                }
                                                                style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    padding: '0.25rem 0.5rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    height: '26px'
                                                                }}
                                                            >
                                                                <FaTrash size={9} />
                                                                Delete ({dateUtils.format(row.original.createdat)})
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {data.filter(t => t.id !== newRowId).length === 0 && !newRowId && (
                        <tr>
                            <td colSpan={table.getAllColumns().length} style={{ textAlign: 'center', padding: '1.5rem' }}>
                                <Small>Click "Add New" to create your first transaction.</Small>
                            </td>
                        </tr>
                    )}
                    {isReadonly && newRowId && data.filter(t => t.id !== newRowId).length > 0 && (
                        <tr>
                            <td colSpan={table.getAllColumns().length} style={{ textAlign: 'center', padding: '0.75rem', fontStyle: 'italic', color: '#6c757d' }}>
                                <Small>Existing transactions are hidden while adding new. Complete or cancel to view all transactions.</Small>
                            </td>
                        </tr>
                    )}
                </tbody>
            </StyledTable>
        </div>
    );
};

export default TransactionTable;
