import { useState, useEffect } from 'react';
import { CurrencyService, Currency } from '../services/api/graphQL/currency';
import { InvestmentTypesService, InvestmentType } from '../services/api/graphQL/investmentTypes';
import { ProductTypesService, ProductType } from '../services/api/graphQL/productTypes';
import { CouponFrequenciesService, CouponFrequency } from '../services/api/graphQL/couponFrequencies';
import { CouponTypesService, CouponType } from '../services/api/graphQL/couponTypes';
import { SpvService, Spv } from '../services/api/graphQL/spv';

interface UseProductSetupData {
    // Data states
    currencies: Currency[];
    investmentTypes: InvestmentType[];
    productTypes: ProductType[];
    couponFrequencies: CouponFrequency[];
    couponTypes: CouponType[];
    spvs: Spv[];

    // Loading states
    currencyLoading: boolean;
    investmentTypesLoading: boolean;
    productTypesLoading: boolean;
    couponFrequenciesLoading: boolean;
    couponTypesLoading: boolean;
    spvsLoading: boolean;

    // Error states
    currencyError: Error | null;
    investmentTypesError: Error | null;
    productTypesError: Error | null;
    couponFrequenciesError: Error | null;
    couponTypesError: Error | null;
    spvsError: Error | null;

    // Selected values
    selectedInvestmentType: string;
    selectedProductType: string;
    selectedCouponFrequency: string;
    selectedCouponType: string;
    selectedCurrency: string;

    // Setters for selected values
    setSelectedInvestmentType: (value: string) => void;
    setSelectedProductType: (value: string) => void;
    setSelectedCouponFrequency: (value: string) => void;
    setSelectedCouponType: (value: string) => void;
    setSelectedCurrency: (value: string) => void;

    // Cache management
    refreshData: () => Promise<void>;
}

export const useProductSetupData = (): UseProductSetupData => {    // Data states
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [couponFrequencies, setCouponFrequencies] = useState<CouponFrequency[]>([]);
    const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
    const [spvs, setSpvs] = useState<Spv[]>([]);

    // Loading states
    const [currencyLoading, setCurrencyLoading] = useState(true);
    const [investmentTypesLoading, setInvestmentTypesLoading] = useState(true);
    const [productTypesLoading, setProductTypesLoading] = useState(true);
    const [couponFrequenciesLoading, setCouponFrequenciesLoading] = useState(true);
    const [couponTypesLoading, setCouponTypesLoading] = useState(true);
    const [spvsLoading, setSpvsLoading] = useState(true);

    // Error states
    const [currencyError, setCurrencyError] = useState<Error | null>(null);
    const [investmentTypesError, setInvestmentTypesError] = useState<Error | null>(null);
    const [productTypesError, setProductTypesError] = useState<Error | null>(null);
    const [couponFrequenciesError, setCouponFrequenciesError] = useState<Error | null>(null);
    const [couponTypesError, setCouponTypesError] = useState<Error | null>(null);
    const [spvsError, setSpvsError] = useState<Error | null>(null);

    // Selected values with defaults
    const [selectedInvestmentType, setSelectedInvestmentType] = useState<string>('Single');
    const [selectedProductType, setSelectedProductType] = useState<string>('Private Equity');
    const [selectedCouponFrequency, setSelectedCouponFrequency] = useState<string>('Monthly');
    const [selectedCouponType, setSelectedCouponType] = useState<string>('Fixed');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

    const loadData = async () => {
        try {
            const currencyData = await CurrencyService.getInstance().loadCurrencies();
            setCurrencies(currencyData || []);
            setCurrencyError(null);
        } catch (error) {
            setCurrencyError(error as Error);
        } finally {
            setCurrencyLoading(false);
        }

        try {
            const investmentTypesData = await InvestmentTypesService.getInstance().loadInvestmentTypes();
            setInvestmentTypes(investmentTypesData || []);
            setInvestmentTypesError(null);
        } catch (error) {
            setInvestmentTypesError(error as Error);
        } finally {
            setInvestmentTypesLoading(false);
        }

        try {
            const productTypesData = await ProductTypesService.getInstance().loadProductTypes();
            setProductTypes(productTypesData || []);
            setProductTypesError(null);
        } catch (error) {
            setProductTypesError(error as Error);
        } finally {
            setProductTypesLoading(false);
        }

        try {
            const couponFrequenciesData = await CouponFrequenciesService.getInstance().loadFrequencies();
            setCouponFrequencies(couponFrequenciesData || []);
            setCouponFrequenciesError(null);
        } catch (error) {
            setCouponFrequenciesError(error as Error);
        } finally {
            setCouponFrequenciesLoading(false);
        }        try {
            const couponTypesData = await CouponTypesService.getInstance().loadCouponTypes();
            setCouponTypes(couponTypesData || []);
            setCouponTypesError(null);
        } catch (error) {
            setCouponTypesError(error as Error);
        } finally {
            setCouponTypesLoading(false);
        }

        try {
            const spvsData = await SpvService.getInstance().loadSpvs();
            setSpvs(spvsData || []);
            setSpvsError(null);
        } catch (error) {
            setSpvsError(error as Error);
        } finally {
            setSpvsLoading(false);
        }
    };

    // Function to refresh all data (clears cache and refetches)
    const refreshData = async () => {
        // Clear all caches
        CurrencyService.getInstance().clearCache();
        InvestmentTypesService.getInstance().clearCache();
        ProductTypesService.getInstance().clearCache();
        CouponFrequenciesService.getInstance().clearCache();
        CouponTypesService.getInstance().clearCache();

        // Reset loading states
        setCurrencyLoading(true);
        setInvestmentTypesLoading(true);
        setProductTypesLoading(true);
        setCouponFrequenciesLoading(true);
        setCouponTypesLoading(true);

        // Reload all data
        await loadData();
    };

    useEffect(() => {
        loadData();
    }, []);    return {
        // Data
        currencies,
        investmentTypes,
        productTypes,
        couponFrequencies,
        couponTypes,
        spvs,

        // Loading states
        currencyLoading,
        investmentTypesLoading,
        productTypesLoading,
        couponFrequenciesLoading,
        couponTypesLoading,
        spvsLoading,

        // Error states
        currencyError,
        investmentTypesError,
        productTypesError,
        couponFrequenciesError,
        couponTypesError,
        spvsError,

        // Selected values
        selectedInvestmentType,
        selectedProductType,
        selectedCouponFrequency,
        selectedCouponType,
        selectedCurrency,

        // Setters
        setSelectedInvestmentType,
        setSelectedProductType,
        setSelectedCouponFrequency,
        setSelectedCouponType,
        setSelectedCurrency,

        // Cache management
        refreshData
    };
};
