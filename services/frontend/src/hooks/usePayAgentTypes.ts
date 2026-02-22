import { useState, useEffect } from 'react';
import { PayAgentTypesService, PayAgentType } from '../services/api/graphQL/payAgentTypes';

interface UsePayAgentTypesResult {
    payAgentTypes: PayAgentType[];
    loading: boolean;
    error: Error | null;
    selectedPayAgentType: string;
    setSelectedPayAgentType: (value: string) => void;
    refreshData: () => Promise<void>;
}

export const usePayAgentTypes = (): UsePayAgentTypesResult => {
    const [payAgentTypes, setPayAgentTypes] = useState<PayAgentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedPayAgentType, setSelectedPayAgentType] = useState<string>('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await PayAgentTypesService.getInstance().loadPayAgentTypes();
            setPayAgentTypes(data ?? []);
            setError(null);
        } catch (error) {
            setError(error as Error);
            console.error('Error loading pay agent types:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        PayAgentTypesService.getInstance().clearCache();
        await loadData();
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        payAgentTypes,
        loading,
        error,
        selectedPayAgentType,
        setSelectedPayAgentType,
        refreshData
    };
};
