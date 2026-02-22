import React from 'react';
import type { CustomSectionProps } from '../../types/dynamicForm';

// Real custom section components
import BasketAssetsSection from '../casemanagement/productsetup/sections/BasketAssetsSection';
import FeesSection from '../casemanagement/productsetup/sections/FeesSection';
import CostsSection from '../casemanagement/productsetup/sections/CostsSection';
import SubscriptionCostsSection from '../casemanagement/productsetup/sections/SubscriptionCostsSection';
import ISINsSectionWrapper from '../casemanagement/productsetup/sections/ISINsSectionWrapper';

/**
 * Custom Section Registry
 * 
 * Maps custom section component names (from JSON config) to actual React components.
 * Custom sections are used for complex UI that cannot be expressed in field configuration
 * (e.g., ISINs section, Basket Assets, Fees with toggle switches, etc.)
 */

/**
 * Custom Section Registry
 * 
 * Add entries here as custom sections are extracted from existing forms.
 */
export const CustomSectionRegistry: Record<string, React.FC<CustomSectionProps>> = {
    // Extracted sections
    BasketAssetsSection,
    FeesSection,
    CostsSection,
    SubscriptionCostsSection,
    ISINsSection: ISINsSectionWrapper,
};

/**
 * Get a custom section component from the registry.
 * Returns undefined if component is not found.
 */
export const getCustomSectionComponent = (
    componentName: string
): React.FC<CustomSectionProps> | undefined => {
    return CustomSectionRegistry[componentName];
};

export default CustomSectionRegistry;
