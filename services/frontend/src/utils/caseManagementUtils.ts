/**
 * Compartment Status IDs used throughout the application
 */
export const COMPARTMENT_STATUS_IDS = {
    PRODUCT_SETUP: 7,
    SUBSCRIPTION: 8,
    ISSUED: 9
} as const;

/**
 * Utility function to generate case management URLs based on compartment status
 * @param caseId - The case ID
 * @param compartmentId - The compartment status ID (7: product-setup, 8: subscriptions, 9: compartment-overview)
 * @returns The formatted URL string for case management navigation
 */
export const generateCaseManagementUrl = (caseId: string, compartmentId: number): string => {
    const baseUrl = '/case-management';
    
    // Map compartment IDs to their corresponding routes
    const compartmentRoutes: Record<number, string> = {
        [COMPARTMENT_STATUS_IDS.PRODUCT_SETUP]: 'product-setup',      // Setup status
        [COMPARTMENT_STATUS_IDS.SUBSCRIPTION]: 'subscriptions',       // Subscription status  
        [COMPARTMENT_STATUS_IDS.ISSUED]: 'compartment-overview'       // Issued status
    };
    
    const route = compartmentRoutes[compartmentId];
    
    if (!route) {
        // Default fallback to product-setup if compartment ID is not recognized
        console.warn(`Unknown compartment ID: ${compartmentId}. Falling back to product-setup.`);
        return `${baseUrl}/${caseId}/product-setup`;
    }
    
    return `${baseUrl}/${caseId}/${route}`;
};

/**
 * Utility function to get the display name for a compartment status
 * @param compartmentId - The compartment status ID
 * @returns The display name for the compartment
 */
export const getCompartmentDisplayName = (compartmentId: number): string => {
    const displayNames: Record<number, string> = {
        [COMPARTMENT_STATUS_IDS.PRODUCT_SETUP]: 'Setup',
        [COMPARTMENT_STATUS_IDS.SUBSCRIPTION]: 'Subscription', 
        [COMPARTMENT_STATUS_IDS.ISSUED]: 'Issued'
    };
    
    return displayNames[compartmentId] || 'Unknown';
};
