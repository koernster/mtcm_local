import { useMemo } from 'react';
import { useProductSetupData } from './useProductSetupData';
import { usePayAgentTypes } from './usePayAgentTypes';
import { useCouponPaymentScheduleTypes } from './useCouponPaymentScheduleTypes';

/**
 * Options registry type - maps source names to option arrays
 */
export interface OptionsRegistry {
    [key: string]: unknown[];
}

/**
 * Hook that consolidates all dropdown options into a single registry.
 * 
 * Used by DynamicField to resolve options based on FieldConfig.options.source
 * 
 * @example
 * // In FieldConfig:
 * { options: { source: "investmentTypes", valueKey: "id", labelKey: "typename" } }
 * 
 * // The DynamicField will lookup: optionsRegistry["investmentTypes"]
 */
export const useOptionsRegistry = (): OptionsRegistry => {
    const {
        investmentTypes,
        productTypes,
        couponFrequencies,
        couponTypes,
        spvs,
    } = useProductSetupData();

    const { payAgentTypes } = usePayAgentTypes();
    const { scheduleTypes } = useCouponPaymentScheduleTypes();

    return useMemo(
        () => ({
            // Product setup options
            investmentTypes: investmentTypes || [],
            productTypes: productTypes || [],
            couponFrequencies: couponFrequencies || [],
            couponTypes: couponTypes || [],
            spvs: spvs || [],

            // Other options
            payAgentTypes: payAgentTypes || [],
            scheduleTypes: scheduleTypes || [],
        }),
        [
            investmentTypes,
            productTypes,
            couponFrequencies,
            couponTypes,
            spvs,
            payAgentTypes,
            scheduleTypes,
        ]
    );
};

export default useOptionsRegistry;
