import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuySellIsinData } from '../../services/api/graphQL/caseisins/types/caseisins';
import { BuySellTradeData } from '../../services/api/graphQL/trade/types/trade';
import { CouponInterest } from '../../services/api/graphQL/couponinterest/types/couponinterest';

// Extend the existing BuySellTradeData with UI-specific calculated fields
export interface BuySellTransactionExtended extends BuySellTradeData {
    priceClean: number;                    // CALCULATED field
    settlementAmount: number;              // CALCULATED field  
    daysAccrued: number;                   // CALCULATED field
    accruedCurrency: number;               // CALCULATED field
    transactionFeeAmount: number;         // CALCULATED field from tranfee
    interestRate?: number;                 // CALCULATED field - applicable interest rate
}

// Alias for backward compatibility
export type BuySellTransaction = BuySellTransactionExtended;

interface BuySellState {
    transactions: BuySellTransaction[];
    isinData: BuySellIsinData | null;
    tradesData: BuySellTradeData[];
    couponInterests: CouponInterest[];
    loading: boolean;
    error: string | null;
}

const initialState: BuySellState = {
    transactions: [],
    isinData: null,
    tradesData: [],
    couponInterests: [],
    loading: false,
    error: null
};

const buySellSlice = createSlice({
    name: 'buySell',
    initialState,
    reducers: {
        addTransaction: (state, action: PayloadAction<BuySellTransaction | Omit<BuySellTransaction, 'id' | 'createdat'>>) => {
            const now = new Date().toISOString();
            const newTransaction: BuySellTransaction = {
                ...action.payload,
                id: 'id' in action.payload ? action.payload.id : Date.now().toString(),
                createdat: 'createdat' in action.payload ? action.payload.createdat : now
            };
            state.transactions.push(newTransaction);
        },
        updateTransaction: (state, action: PayloadAction<{ id: string; field: keyof BuySellTransaction; value: any }>) => {
            const { id, field, value } = action.payload;
            const transaction = state.transactions.find(t => t.id === id);
            if (transaction) {
                (transaction as any)[field] = value;
            }
        },
        removeTransaction: (state, action: PayloadAction<string>) => {
            state.transactions = state.transactions.filter(t => t.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearTransactions: (state) => {
            state.transactions = [];
        },
        setTransactions: (state, action: PayloadAction<BuySellTransaction[]>) => {
            state.transactions = action.payload;
        },
        setIsinData: (state, action: PayloadAction<BuySellIsinData | null>) => {
            state.isinData = action.payload;
        },
        setTradesData: (state, action: PayloadAction<BuySellTradeData[]>) => {
            state.tradesData = action.payload;
        },
        setCouponInterests: (state, action: PayloadAction<CouponInterest[]>) => {
            state.couponInterests = action.payload;
        },
        updateCouponInterest: (state, action: PayloadAction<CouponInterest>) => {
            const index = state.couponInterests.findIndex(ci => ci.id === action.payload.id);
            if (index !== -1) {
                state.couponInterests[index] = action.payload;
            }
        }
    }
});

export const {
    addTransaction,
    updateTransaction,
    removeTransaction,
    setLoading,
    setError,
    clearTransactions,
    setTransactions,
    setIsinData,
    setTradesData,
    setCouponInterests,
    updateCouponInterest
} = buySellSlice.actions;

export default buySellSlice.reducer;
