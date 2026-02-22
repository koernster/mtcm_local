import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import {
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { RootState } from '../../store/store';
import { 
    BuySellTransaction, 
    addTransaction, 
    updateTransaction,
    removeTransaction,
    setTransactions
} from '../../store/slices/buySellSlice';
import { useBuySellTrades } from '../../hooks/useBuySellTrades';
import { 
    calculateDaysAccrued,
    calculateAccruedInterest,
    calculateDirtyPrice,
    calculateSettlementAmount,
    calculateTransactionFeeCurrency,
    couponPaymentDates,
    findApplicableCouponInterest
} from '../../utils/buySellCalculations';
import { createEmptyTransaction, transformTradesToTransactions } from '../../utils/tradeTransformations';
import ISINInfoCard from './ISINInfoCard';
import TransactionControls from './TransactionControls';
import TransactionTable from './TransactionTable';
import { createTransactionColumns } from './TransactionColumns';
import { CouponFrequencies } from '../../types/CouponFrequencies';
import toast from 'react-hot-toast';

const BuySellComponent: React.FC<{ isinId: string }> = ({ isinId }) => {
    const dispatch = useDispatch();
    const { 
        transactions, 
        isinData, 
        tradesData, 
        couponInterests,
        loading, 
        error 
    } = useSelector((state: RootState) => state.buySell);
    
    // Initialize data loading and get update functions
    const { updateInterestRate, saveTrade } = useBuySellTrades(isinId);
    
    // Cleanup when component unmounts or isinId changes
    useEffect(() => {
        return () => {
            // Optional: Clear data when component unmounts
            // Uncomment if you want to clear data when navigating away
            // dispatch(setTransactions([]));
        };
    }, [isinId]);
    
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [showCouponDates, setShowCouponDates] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowId, setNewRowId] = useState<string | undefined>();

    // Load trades from API when tradesData is available
    useEffect(() => {
        if (tradesData && tradesData.length > 0 && !loading && isinData) {
            // Transform API trades data to transaction format with calculations
            const transformedTransactions = transformTradesToTransactions(tradesData).map(transaction => {
                try {
                    // Calculate days accrued
                    const daysAccrued = calculateDaysAccrued(
                        transaction.valuedate,
                        isinData.issueDate,
                        isinData.maturityDate,
                        isinData.couponFrequency || 'Semi-Annually'
                    );

                    // Find applicable coupon interest for this transaction
                    const applicableCouponInterest = findApplicableCouponInterest(
                        transaction.tradedate,
                        transaction.valuedate,
                        couponInterests
                    );

                    // Calculate accrued interest - using applicable coupon interest if available
                    const couponRate = isinData.couponInterests.length > 0 
                        ? isinData.couponInterests[0].interestrate 
                        : 5.0; // fallback rate
                        
                    const accruedCurrency = calculateAccruedInterest(
                        daysAccrued,
                        transaction.notional,
                        couponRate,
                        360, // day count
                        transaction.tradedate,
                        transaction.valuedate,
                        couponInterests
                    );

                    // Calculate transaction fee in currency from percentage (if not already set)
                    const transactionFeeCurrency = calculateTransactionFeeCurrency(
                        transaction.notional,
                        transaction.tranfee || 0
                    );

                    // Calculate settlement amount
                    const settlementAmount = calculateSettlementAmount(
                        transaction.priceClean || 100, // Use existing priceClean or default to 100
                        transaction.notional,
                        transactionFeeCurrency,
                        accruedCurrency
                    );

                    // Calculate dirty price from settlement amount
                    const priceDirty = calculateDirtyPrice(settlementAmount, transaction.notional);

                    return {
                        ...transaction,
                        daysAccrued,
                        accruedCurrency,
                        settlementAmount,
                        price_dirty: priceDirty,
                        transactionFeeAmount: transactionFeeCurrency,
                        interestRate: applicableCouponInterest?.interestrate || couponRate
                    };
                } catch (error) {
                    console.error('Error calculating transaction fields:', error);
                    return transaction; // Return original if calculation fails
                }
            });
            
            // Replace all transactions with calculated data from API
            dispatch(setTransactions(transformedTransactions));
            
        } else if (tradesData && tradesData.length === 0 && !loading) {
            // Clear transactions if API returns empty array
            dispatch(setTransactions([]));
        }
    }, [tradesData, loading, isinData, dispatch]);

    // Create data with all transactions, including the new row when adding
    const tableData = useMemo(() => {
        // Show all transactions except temporary new rows that are being cancelled
        const allTransactions = transactions.filter(t => !t.id.startsWith('new-row-') || t.id === newRowId);
        return allTransactions;
    }, [transactions, newRowId]);

    // Calculate coupon payment dates for the selected ISIN
    const couponDates = useMemo(() => {
        if (!isinData) return [];
        
        try {
            const issueDate = new Date(isinData.issueDate);
            const maturityDate = new Date(isinData.maturityDate);
            return couponPaymentDates(issueDate, maturityDate, isinData.couponFrequency as CouponFrequencies);
        } catch (error) {
            console.error('Error calculating coupon dates:', error);
            toast.error('Error calculating coupon dates');
            return [];
        }
    }, [isinData]);

    const handleAddNew = useCallback(() => {
        if (isAddingNew) return;
        
        // Generate a temporary ID for the new row
        const tempId = `new-row-${Date.now()}`;
        setNewRowId(tempId);
        setIsAddingNew(true);
        
        // Create a new empty transaction using the utility
        const newTransaction = createEmptyTransaction('Buy');
        newTransaction.id = tempId; // Override with temporary ID
        
        dispatch(addTransaction(newTransaction));
    }, [dispatch, isAddingNew]);

    const handleSaveNewRow = useCallback(() => {
        if (newRowId) {
            // Generate a permanent ID for the transaction
            const permanentId = `txn-${Date.now()}`;
            const tempTransaction = transactions.find(t => t.id === newRowId);
            
            if (tempTransaction) {
                // Update the transaction with permanent ID
                dispatch(updateTransaction({ id: newRowId, field: 'id', value: permanentId }));
            }
        }
        
        setIsAddingNew(false);
        setNewRowId(undefined);
    }, [dispatch, transactions, newRowId]);

    const handleCancelNew = useCallback(() => {
        if (newRowId) {
            // Remove the temporary transaction
            dispatch(removeTransaction(newRowId));
        }
        
        setIsAddingNew(false);
        setNewRowId(undefined);
    }, [dispatch, newRowId]);

    const handleFieldChange = useCallback((id: string, field: keyof BuySellTransaction, value: any) => {
        // Only update the field value, no calculations on change
        dispatch(updateTransaction({ id, field, value }));
    }, [dispatch]);

    const handleFieldBlur = useCallback((id: string, field: keyof BuySellTransaction) => {
        // Trigger recalculations for computed fields on blur
        const transaction = transactions.find(t => t.id === id);
        if (transaction && isinData) {
            const updatedTransaction = { ...transaction };

            // Recalculate computed fields only if this field affects calculations
            if (['valuedate', 'notional', 'tranfee', 'priceClean', 'price_dirty'].includes(field)) {
                // Calculate days accrued
                const daysAccrued = calculateDaysAccrued(
                    updatedTransaction.valuedate,
                    isinData.issueDate,
                    isinData.maturityDate,
                    isinData.couponFrequency || 'Semi-Annually'
                );
                dispatch(updateTransaction({ id, field: 'daysAccrued', value: daysAccrued }));

                // Find applicable coupon interest for this transaction
                const applicableCouponInterest = findApplicableCouponInterest(
                    updatedTransaction.tradedate,
                    updatedTransaction.valuedate,
                    couponInterests
                );

                // Calculate accrued interest - using applicable coupon interest if available
                const couponRate = isinData.couponInterests.length > 0 
                    ? isinData.couponInterests[0].interestrate 
                    : 0.0; // fallback rate
                    
                const accruedCurrency = calculateAccruedInterest(
                    daysAccrued,
                    updatedTransaction.notional,
                    couponRate,
                    360, // day count
                    updatedTransaction.tradedate,
                    updatedTransaction.valuedate,
                    couponInterests
                );
                dispatch(updateTransaction({ id, field: 'accruedCurrency', value: accruedCurrency }));

                // Update interest rate for this transaction
                const effectiveInterestRate = applicableCouponInterest?.interestrate || couponRate;
                dispatch(updateTransaction({ id, field: 'interestRate', value: effectiveInterestRate }));

                // Calculate transaction fee in currency
                const transactionFeeCurrency = calculateTransactionFeeCurrency(
                    updatedTransaction.notional,
                    updatedTransaction.tranfee || 0
                );
                dispatch(updateTransaction({ id, field: 'transactionFeeAmount', value: transactionFeeCurrency }));

                // Calculate settlement amount
                const settlementAmount = calculateSettlementAmount(
                    updatedTransaction.priceClean || 100,
                    updatedTransaction.notional,
                    transactionFeeCurrency,
                    accruedCurrency
                );
                dispatch(updateTransaction({ id, field: 'settlementAmount', value: settlementAmount }));

                // Calculate dirty price
                const priceDirty = calculateDirtyPrice(settlementAmount, updatedTransaction.notional);
                dispatch(updateTransaction({ id, field: 'price_dirty', value: priceDirty }));
            }
        }
    }, [dispatch, transactions, isinData]);

    const handleTabOnLastField = useCallback((e: React.KeyboardEvent<HTMLElement>, transactionId: string) => {
        // Check if Enter key was pressed in new row to save and exit adding mode
        if (e.key === 'Enter' && transactionId === newRowId && isAddingNew) {
            e.preventDefault();
            handleSaveNewRow();
        }
    }, [newRowId, isAddingNew, handleSaveNewRow]);

    const handleSaveTransaction = useCallback(async (transactionId: string) => {
        try {
            const transaction = transactions.find(t => t.id === transactionId);
            if (!transaction) {
                throw new Error('Transaction not found');
                return;
            }

            // Validate required fields
            if (!transaction.tradetypeName || !transaction.tradedate || !transaction.valuedate || !transaction.notional || !transaction.bank_investor || !transaction.counterparty) {
                toast.error('Please fill in all required fields (Type, Trade Date, Value Date, Notional, Bank/Investor, and Counterparty)');
                return;
            }

            // Check if this is a new transaction being saved
            const isNewTransaction = transactionId === newRowId;
            
            // Save to database first
            await saveTrade(transaction);
            
            // Only if database save was successful, proceed with UI updates
            if (isNewTransaction) {
                // Exit adding mode after successful database save
                setIsAddingNew(false);
                setNewRowId(undefined);
            }
            
            // Show success notification
            toast.success('Trade saved successfully');
            
            // The data reload is handled in the saveTrade hook, so the table will automatically show updated data
        } catch (err) {
            console.error('Error saving transaction:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to save trade');
            // Don't exit edit mode if save failed
        }
    }, [transactions, newRowId, dispatch, saveTrade, setIsAddingNew, setNewRowId]);

    const handleDeleteTransaction = useCallback((transactionId: string) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        // Check if transaction is within 24-hour deletion window
        const createdAt = new Date(transaction.createdat);
        const now = new Date();
        const hoursDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDifference > 24) {
            alert('This transaction cannot be deleted. Deletion is only allowed within 24 hours of creation.');
            return;
        }

        // Confirm deletion
        if (window.confirm(`Are you sure you want to delete transaction ${transaction.reference || transactionId}?`)) {
            // Remove from Redux store
            dispatch(removeTransaction(transactionId));
            
            console.log('Deleted transaction:', transactionId);
        }
    }, [transactions, dispatch]);

    // Utility function to check if transaction can be deleted
    const canDeleteTransaction = useCallback((transaction: BuySellTransaction): boolean => {
        // Don't allow deletion of new rows being edited
        if (transaction.id.startsWith('new-row-')) return false;
        const createdAt = new Date(transaction.createdat);
        const now = new Date();
        const hoursDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        return hoursDifference <= 24;
    }, []);

    // React Table column definitions
    const columns = useMemo(() => createTransactionColumns(
        isinData,
        handleFieldChange,
        handleFieldBlur,
        handleTabOnLastField,
        newRowId
    ), [isinData, handleFieldChange, handleFieldBlur, handleTabOnLastField, newRowId]);

    return (
        <Container fluid style={{ padding: '0.25rem' }}>
            <Row>
                <Col>
                    {/* ISIN Information Card */}
                    <ISINInfoCard 
                        isinData={isinData}
                        couponInterests={couponInterests}
                        loading={loading}
                        error={error ? new Error(error) : null}
                        onUpdateInterestRate={updateInterestRate}
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    {/* Header and Controls */}
                    <hr style={{ margin: '0.5rem 0', borderColor: '#dee2e6', borderWidth: '1px' }} />

                    <TransactionControls
                        transactionCount={transactions.filter(t => !t.id.startsWith('new-row-')).length}
                        sorting={sorting}
                        setSorting={setSorting}
                        couponDates={couponDates}
                        showCouponDates={showCouponDates}
                        setShowCouponDates={setShowCouponDates}
                        onAddNew={handleAddNew}
                        onCancelNew={handleCancelNew}
                        isAddingNew={isAddingNew}
                    />

                    {/* Transactions Table */}
                    <TransactionTable
                        data={tableData}
                        columns={columns}
                        sorting={sorting}
                        setSorting={setSorting}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        isReadonly={isAddingNew}
                        newRowId={newRowId}
                        expandedRowId={isAddingNew && newRowId ? newRowId : undefined}
                        onFieldChange={handleFieldChange}
                        onSaveTransaction={handleSaveTransaction}
                        onDeleteTransaction={handleDeleteTransaction}
                        canDeleteTransaction={canDeleteTransaction}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default BuySellComponent;
