import { generateCaseManagementUrl, getCompartmentDisplayName, COMPARTMENT_STATUS_IDS } from './caseManagementUtils';

// Simple test function to verify the utility works correctly
export const testCaseManagementUtils = () => {
    console.log('Testing Case Management Utils:');
    
    // Test URL generation
    console.log('Setup URL:', generateCaseManagementUrl('case-123', COMPARTMENT_STATUS_IDS.PRODUCT_SETUP));
    // Expected: /case-management/case-123/product-setup
    
    console.log('Subscription URL:', generateCaseManagementUrl('case-456', COMPARTMENT_STATUS_IDS.SUBSCRIPTION));
    // Expected: /case-management/case-456/subscriptions
    
    console.log('Issued URL:', generateCaseManagementUrl('case-789', COMPARTMENT_STATUS_IDS.ISSUED));
    // Expected: /case-management/case-789/compartment-overview
    
    console.log('Unknown ID URL:', generateCaseManagementUrl('case-000', 999));
    // Expected: /case-management/case-000/product-setup (fallback)
    
    // Test display names
    console.log('Display Names:');
    console.log('Product Setup:', getCompartmentDisplayName(COMPARTMENT_STATUS_IDS.PRODUCT_SETUP)); // Expected: Setup
    console.log('Subscription:', getCompartmentDisplayName(COMPARTMENT_STATUS_IDS.SUBSCRIPTION)); // Expected: Subscription
    console.log('Issued:', getCompartmentDisplayName(COMPARTMENT_STATUS_IDS.ISSUED)); // Expected: Issued
    console.log('Unknown:', getCompartmentDisplayName(999)); // Expected: Unknown
    
    // Test constants
    console.log('Constants:');
    console.log('PRODUCT_SETUP:', COMPARTMENT_STATUS_IDS.PRODUCT_SETUP); // Expected: 7
    console.log('SUBSCRIPTION:', COMPARTMENT_STATUS_IDS.SUBSCRIPTION); // Expected: 8
    console.log('ISSUED:', COMPARTMENT_STATUS_IDS.ISSUED); // Expected: 9
};

// Uncomment to run tests
// testCaseManagementUtils();
