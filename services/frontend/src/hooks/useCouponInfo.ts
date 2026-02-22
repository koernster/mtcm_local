import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { CouponInfo } from '../types/coupon';

export const useCouponInfo = (): {
    couponInfo: CouponInfo | null;
    loading: boolean;
    error: string | null;
} => {
    return useSelector((state: RootState) => state.coupon);
};
