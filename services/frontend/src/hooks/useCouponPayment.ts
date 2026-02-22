import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CouponPaymentService from '../services/api/graphQL/couponPayment/service';
import { InterestCouponPayment } from '../services/api/graphQL/couponPayment/types/couponpayment';
import { setCouponPayments, setLoading, setError, clearCouponPayments } from '../store/slices/couponPaymentSlice';
import { RootState } from '../store/store';

/**
 * Custom hook for Coupon Payment operations data loading.
 * 
 * This hook provides:
 * - Coupon payment data loading by case ID
 * - Loading states and error handling
 * - Data clearing and refresh functionality
 * 
 * @param caseId - The case ID to load coupon payments for
 * @returns {Object} Coupon payments data, loading states, and error handling
 */
export const useCouponPayment = (caseId: string | null) => {
    const dispatch = useDispatch();
    const couponPaymentService = CouponPaymentService.getInstance();
    const currentCaseIdRef = useRef<string | null>(null);
    
    // Get data from Redux store
    const { couponPayments, loading, error } = useSelector((state: RootState) => state.couponPayment);

    // Keep local loading state for individual operations
    const [couponPaymentsLoading, setCouponPaymentsLoading] = useState(false);

    /**
     * Load coupon payments data by case ID
     */
    const loadCouponPayments = useCallback(async (id: string) => {
        try {
            setCouponPaymentsLoading(true);
            dispatch(setError(null));
            
            const data = await couponPaymentService.getCouponPaymentsByCaseId(id);
            dispatch(setCouponPayments(data));
        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Failed to load coupon payments'));
            dispatch(setCouponPayments([]));
        } finally {
            setCouponPaymentsLoading(false);
        }
    }, [couponPaymentService, dispatch]);

    // Load data when caseId changes
    useEffect(() => {
        // Prevent duplicate calls for the same case
        if (caseId && caseId !== currentCaseIdRef.current) {
            currentCaseIdRef.current = caseId;
            
            // Clear existing data when switching cases
            dispatch(clearCouponPayments());
            dispatch(setLoading(true));
            
            // Load fresh data
            loadCouponPayments(caseId).finally(() => {
                dispatch(setLoading(false));
            });
        } else if (!caseId && currentCaseIdRef.current) {
            // Reset state when no caseId
            currentCaseIdRef.current = null;
            dispatch(setCouponPayments([]));
            dispatch(clearCouponPayments());
            dispatch(setError(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseId, dispatch]); // Intentionally excluding loadCouponPayments to prevent infinite re-renders

    return {
        // Coupon payments data
        couponPayments,
        couponPaymentsLoading,
        couponPaymentsError: error,
        
        // Loading state
        loading,
        
        // Manual reload function
        loadCouponPayments: () => caseId ? loadCouponPayments(caseId) : Promise.resolve(),
        
        // Clear function
        clearPayments: () => dispatch(clearCouponPayments())
    };
};