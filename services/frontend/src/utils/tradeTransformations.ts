import { BuySellTradeData } from '../services/api/graphQL/trade/types/trade';
import { BuySellTransaction } from '../store/slices/buySellSlice';

/**
 * Transforms API trade data (BuySellTradeData) into the extended transaction format
 * with calculated fields for UI usage
 * 
 * @param tradeData - Trade data from the API
 * @param calculatedFields - Optional pre-calculated fields
 * @returns Extended transaction with calculated fields
 */
export const transformTradeToTransaction = (
    tradeData: BuySellTradeData,
    calculatedFields?: Partial<{
        priceClean: number;
        settlementAmount: number;
        daysAccrued: number;
        accruedCurrency: number;
        transactionFeeAmount: number;
    }>
): BuySellTransaction => {
    return {
        // API fields (direct mapping)
        ...tradeData,
        
        // Calculated fields (with defaults)
        priceClean: calculatedFields?.priceClean ?? 0,
        settlementAmount: calculatedFields?.settlementAmount ?? 0,
        daysAccrued: calculatedFields?.daysAccrued ?? 0,
        accruedCurrency: calculatedFields?.accruedCurrency ?? 0,
        transactionFeeAmount: calculatedFields?.transactionFeeAmount ?? 0,
        
        // UI tracking
        createdAt: new Date().toISOString()
    };
};

/**
 * Transforms multiple API trade data into extended transaction format
 */
export const transformTradesToTransactions = (tradesData: BuySellTradeData[]): BuySellTransaction[] => {
    return tradesData.map(trade => transformTradeToTransaction(trade));
};

/**
 * Creates a new empty transaction template with API field structure
 */
export const createEmptyTransaction = (transactionType: 'Buy' | 'Sell' = 'Buy'): BuySellTransaction => {
    return {
        id: `new-row-${Date.now()}`,
        tradetypeId: transactionType === 'Buy' ? '1' : '2', // Assuming these IDs
        tradetypeName: transactionType,
        tradedate: '',
        valuedate: '',
        notional: 0,
        price_dirty: 0,
        tranfee: 0,
        counterparty: '',
        bank_investor: '',
        reference: '',
        sales: '',
        
        // Calculated fields
        priceClean: 100, // Default clean price
        settlementAmount: 0,
        daysAccrued: 0,
        accruedCurrency: 0,
        transactionFeeAmount: 0,
        
        createdAt: new Date().toISOString()
    };
};