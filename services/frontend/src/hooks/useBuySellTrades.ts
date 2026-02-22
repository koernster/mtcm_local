import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CaseIsinService from '../services/api/graphQL/caseisins/service';
import TradeService from '../services/api/graphQL/trade/service';
import CouponInterestService from '../services/api/graphQL/couponinterest/service';
import { BuySellIsinData } from '../services/api/graphQL/caseisins/types/caseisins';
import { BuySellTradeData } from '../services/api/graphQL/trade/types/trade';
import { CouponInterest } from '../services/api/graphQL/couponinterest/types/couponinterest';
import { TradeInsert } from '../services/api/graphQL/trade/types/trade';
import { BuySellTransaction } from '../store/slices/buySellSlice';
import { setIsinData, setTradesData, setLoading, setError, clearTransactions, setCouponInterests, updateCouponInterest, removeTransaction } from '../store/slices/buySellSlice';
import { RootState } from '../store/store';

/**
 * Custom hook for Buy/Sell operations data loading.
 * 
 * This hook provides:
 * - ISIN data loading for buy/sell operations
 * - Associated trades data for the ISIN
 * - Coupon interest data loading and updating
 * - Loading states and error handling
 * 
 * @param isinId - The ISIN ID to load data for
 * @returns {Object} ISIN data, trades data, coupon interests, loading states, and error handling
 */
export const useBuySellTrades = (isinId: string | null) => {
    const dispatch = useDispatch();
    const caseIsinService = CaseIsinService.getInstance();
    const couponInterestService = CouponInterestService.getInstance();
    const currentIsinRef = useRef<string | null>(null);
    
    // Get data from Redux store instead of local state
    const { isinData, tradesData, couponInterests, loading, error } = useSelector((state: RootState) => state.buySell);

    // Keep local loading states for individual operations
    const [isinLoading, setIsinLoading] = useState(false);
    const [tradesLoading, setTradesLoading] = useState(false);
    const [couponInterestsLoading, setCouponInterestsLoading] = useState(false);

    /**
     * Load ISIN data for buy/sell operations
     */
    const loadIsinData = useCallback(async (id: string) => {
        try {
            setIsinLoading(true);
            dispatch(setError(null));
            
            const data = await caseIsinService.getIsinForBuySell(id);
            dispatch(setIsinData(data));
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to load ISIN data'));
            dispatch(setIsinData(null));
        } finally {
            setIsinLoading(false);
        }
    }, [caseIsinService, dispatch]);

    /**
     * Load trades data for the ISIN
     */
    const loadTradesData = useCallback(async (id: string) => {
        try {
            setTradesLoading(true);
            dispatch(setError(null));
            
            const data = await TradeService.getIsinsTradesForBuySell(id);
            dispatch(setTradesData(data));
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to load trades data'));
            dispatch(setTradesData([]));
        } finally {
            setTradesLoading(false);
        }
    }, [dispatch]);

    /**
     * Load coupon interests data for the ISIN
     */
    const loadCouponInterests = useCallback(async (id: string) => {
        try {
            setCouponInterestsLoading(true);
            dispatch(setError(null));
            
            const data = await couponInterestService.getCouponInterestByIsinId(id);
            dispatch(setCouponInterests(data));
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to load coupon interests'));
            dispatch(setCouponInterests([]));
        } finally {
            setCouponInterestsLoading(false);
        }
    }, [couponInterestService, dispatch]);

    /**
     * Update only the interest rate for a coupon interest
     */
    const updateInterestRate = useCallback(async (couponInterestId: string, interestRate: number) => {
        try {
            dispatch(setError(null));
            
            const updatedCouponInterest = await couponInterestService.updateOnlyInterestRate(couponInterestId, interestRate);
            dispatch(updateCouponInterest(updatedCouponInterest));
            
            return updatedCouponInterest;
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to update interest rate'));
            throw err;
        }
    }, [couponInterestService, dispatch]);

    /**
     * Save a new trade
     */
    const saveTrade = useCallback(async (transaction: BuySellTransaction): Promise<void> => {
        try {
            dispatch(setError(null));
            
            // Store the original transaction ID to remove it after successful save
            const originalTransactionId = transaction.id;
            
            // Generate a UUID for the trade
            const tradeId = crypto.randomUUID();
            
            // Convert tradetype name to number (2 = Buy, 3 = Sell)
            const tradetypeNumber = transaction.tradetypeName === 'Buy' ? 2 : 3;
            
            // Convert BuySellTransaction to TradeInsert format
            const tradeData: TradeInsert = {
                id: tradeId,
                bank_investor: transaction.bank_investor || '',
                counterparty: transaction.counterparty || '',
                isinid: isinData?.id || '',
                notional: transaction.notional,
                price_dirty: transaction.price_dirty,
                reference: transaction.reference || '',
                tranfee: transaction.tranfee,
                tradedate: transaction.tradedate,
                valuedate: transaction.valuedate,
                transtatus: 1, // Default to subscription status
                tradetype: tradetypeNumber
            };

            // Save to database first
            await TradeService.saveTrade(tradeData);
            
            // Remove the temporary transaction from Redux after successful database save
            dispatch(removeTransaction(originalTransactionId));
            
            // Reload fresh trades data from database
            if (isinData?.id) {
                await loadTradesData(isinData.id);
            }
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to save trade'));
            throw err;
        }
    }, [dispatch, isinData, loadTradesData]);

    /**
     * Load both ISIN and trades data
     */
    const loadData = useCallback(async (id: string) => {
        await Promise.all([
            loadIsinData(id),
            loadTradesData(id),
            loadCouponInterests(id)
        ]);
    }, [loadIsinData, loadTradesData, loadCouponInterests]);

    // Load data when isinId changes
    useEffect(() => {
        // Prevent duplicate calls for the same ISIN
        if (isinId && isinId !== currentIsinRef.current) {
            currentIsinRef.current = isinId;
            
            // Clear existing data when switching ISINs
            dispatch(clearTransactions());
            dispatch(setLoading(true));
            
            // Load fresh data
            Promise.all([
                loadIsinData(isinId),
                loadTradesData(isinId),
                loadCouponInterests(isinId)
            ]).finally(() => {
                dispatch(setLoading(false));
            });
        } else if (!isinId && currentIsinRef.current) {
            // Reset state when no isinId
            currentIsinRef.current = null;
            dispatch(setIsinData(null));
            dispatch(setTradesData([]));
            dispatch(setCouponInterests([]));
            dispatch(clearTransactions());
            dispatch(setError(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isinId, dispatch]); // Intentionally excluding loadIsinData, loadTradesData, and loadCouponInterests to prevent infinite re-renders

    return {
        // ISIN data
        isinData,
        isinLoading,
        isinError: error,
        
        // Trades data
        tradesData,
        tradesLoading,
        tradesError: error,
        
        // Coupon interests data
        couponInterests,
        couponInterestsLoading,
        couponInterestsError: error,
        
        // Manual reload functions
        loadIsinData: () => isinId ? loadIsinData(isinId) : Promise.resolve(),
        loadTradesData: () => isinId ? loadTradesData(isinId) : Promise.resolve(),
        loadCouponInterests: () => isinId ? loadCouponInterests(isinId) : Promise.resolve(),
        loadData: () => isinId ? loadData(isinId) : Promise.resolve(),
        
        // Update functions
        updateInterestRate,
        
        // Save functions
        saveTrade
    };
};