import { useState, useEffect } from 'react';
import { CurrencyService, Currency } from '../services/api/graphQL/currency';

export const useCurrencies = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                setLoading(true);
                setError(null);
                const currencyData = await CurrencyService.getInstance().loadCurrencies();
                setCurrencies(currencyData || []);
            } catch (err) {
                setError(err as Error);
                console.error('Error loading currencies:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCurrencies();
    }, []);

    return {
        currencies,
        loading,
        error,
        refetch: async () => {
            CurrencyService.getInstance().clearCache();
            const currencyData = await CurrencyService.getInstance().loadCurrencies();
            setCurrencies(currencyData || []);
        }
    };
};
