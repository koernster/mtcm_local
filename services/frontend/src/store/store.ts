import { configureStore } from '@reduxjs/toolkit';
import caseSetupReducer from './slices/caseSetupSlice';
import caseIsinsReducer from './slices/caseIsinsSlice';
import buySellReducer from './slices/buySellSlice';
import couponReducer from './slices/couponSlice';
import couponPaymentReducer from './slices/couponPaymentSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
    reducer: {
        caseSetup: caseSetupReducer,
        caseIsins: caseIsinsReducer,
        buySell: buySellReducer,
        coupon: couponReducer,
        couponPayment: couponPaymentReducer,
        notifications: notificationsReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
