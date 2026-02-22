import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterestCouponPayment } from '../../services/api/graphQL/couponPayment/types/couponpayment';

interface CouponPaymentState {
    couponPayments: InterestCouponPayment[];
    loading: boolean;
    error: string | null;
}

const initialState: CouponPaymentState = {
    couponPayments: [],
    loading: false,
    error: null
};

const couponPaymentSlice = createSlice({
    name: 'couponPayment',
    initialState,
    reducers: {
        setCouponPayments: (state, action: PayloadAction<InterestCouponPayment[]>) => {
            state.couponPayments = action.payload;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            if (action.payload) {
                state.loading = false;
            }
        },
        clearCouponPayments: (state) => {
            state.couponPayments = [];
            state.error = null;
        }
    }
});

export const {
    setCouponPayments,
    setLoading,
    setError,
    clearCouponPayments
} = couponPaymentSlice.actions;

export default couponPaymentSlice.reducer;