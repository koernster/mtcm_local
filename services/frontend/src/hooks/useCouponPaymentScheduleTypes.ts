import { useState, useEffect } from 'react';
import { CouponPaymentScheduleTypesService, CouponPaymentScheduleType } from '../services/api/graphQL/couponPaymentScheduleTypes';

interface UseCouponPaymentScheduleTypesResult {
    scheduleTypes: CouponPaymentScheduleType[];
    loading: boolean;
    error: Error | null;
    selectedScheduleType: string;
    setSelectedScheduleType: (value: string) => void;
    refreshData: () => Promise<void>;
}

export const useCouponPaymentScheduleTypes = (): UseCouponPaymentScheduleTypesResult => {
    const [scheduleTypes, setScheduleTypes] = useState<CouponPaymentScheduleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedScheduleType, setSelectedScheduleType] = useState<string>('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await CouponPaymentScheduleTypesService.getInstance().loadScheduleTypes();
            setScheduleTypes(data ?? []);
            setError(null);
        } catch (error) {
            setError(error as Error);
            console.error('Error loading coupon payment schedule types:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        CouponPaymentScheduleTypesService.getInstance().clearCache();
        await loadData();
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        scheduleTypes,
        loading,
        error,
        selectedScheduleType,
        setSelectedScheduleType,
        refreshData
    };
};
