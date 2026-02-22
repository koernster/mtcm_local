import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
} from '@tanstack/react-table';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { StyledTable } from '../styled/CommonStyled';
import { Small } from '../styled/TypographyStyled';
import { BuySellTransaction } from '../../store/slices/buySellSlice';

interface TransactionTableProps {
    data: BuySellTransaction[];
    columns: any[];
    sorting: SortingState;
    setSorting: OnChangeFn<SortingState>;
    columnFilters: ColumnFiltersState;
    setColumnFilters: OnChangeFn<ColumnFiltersState>;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
    data,
    columns,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters
}) => {
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div style={{ overflowX: 'auto' }}>
            <StyledTable striped bordered hover responsive>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id}
                                    style={{ 
                                        minWidth: `${header.getSize()}px`,
                                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    }}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && (
                                            <span style={{ marginLeft: '4px' }}>
                                                {{
                                                    asc: <FaSortUp />,
                                                    desc: <FaSortDown />,
                                                }[header.column.getIsSorted() as string] ?? <FaSort />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        const isEmptyRow = row.original.id === 'empty-row';
                        return (
                            <tr 
                                key={row.id} 
                                data-transaction-row={row.original.id}
                                style={{
                                    backgroundColor: isEmptyRow ? '#f8f9fa' : 'inherit',
                                    fontStyle: isEmptyRow ? 'italic' : 'normal',
                                    opacity: isEmptyRow ? 0.7 : 1
                                }}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {data.filter(t => t.id !== 'empty-row').length === 0 && (
                        <tr>
                            <td colSpan={table.getAllColumns().length} style={{ textAlign: 'center', padding: '1rem' }}>
                                <Small>Start typing in the row above to create your first transaction.</Small>
                            </td>
                        </tr>
                    )}
                </tbody>
            </StyledTable>
        </div>
    );
};

export default TransactionTable;
