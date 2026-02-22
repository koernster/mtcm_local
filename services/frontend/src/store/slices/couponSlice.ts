import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CouponInfo } from '../../types/coupon';

interface CouponState {
    couponInfo: CouponInfo | null;
    loading: boolean;
    error: string | null;
}

const tempData: CouponInfo = {
    spv: "Sample SPV",
    compartmentName: "Compartment A",
    ISIN: "US123456789",
    securityIssueDate: "2025-01-01",
    loanIssueDate: "2025-01-01",
    securityMaturityDate: "2030-01-01",
    loanMaturityDate: "2030-01-01",
    securityIssuePrice: "100.00",
    loanIssuePrice: "100.00",
    securityRedemptionPrice: "100.00",
    loanRedemptionPrice: "100.00",
    securityCouponInterest: "5.00",
    loanCouponInterest: "5.00",
    securityFrequency: "Semi-Annual",
    loanFrequency: "Semi-Annual",
    securityDayCount: "30/360",
    loanDayCount: "30/360"
};

const initialState: CouponState = {
    couponInfo: tempData, // Initially loaded with temp data
    loading: false,
    error: null
};

const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        setCouponInfo: (state, action: PayloadAction<CouponInfo>) => {
            state.couponInfo = action.payload;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { setCouponInfo, setLoading, setError } = couponSlice.actions;
export default couponSlice.reducer;
