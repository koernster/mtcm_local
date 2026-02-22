import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
    isCaseFreezedOrLocked, 
    canEditIsin,
    getCaseLockReason,
    canAcceptSubscriptions,
    getCaseStatusMessage,
    isCaseIssued,
} from '../utils/caseStatusUtils';

/**
 * Custom hook to access case freeze/lock status and related utilities
 * @returns Object containing case status methods and data
 */
export const useCaseStatus = () => {
    const caseData = useSelector((state: RootState) => state.caseSetup.caseData);
    
    return {
        // Case data
        caseData,
        
        // Primary status checks
        isCaseFreezed: isCaseFreezedOrLocked(caseData),
        isCaseIssued: isCaseIssued(caseData),
        
        // Functionality checks
        canEditIsin: canEditIsin(caseData),
        canAcceptSubscriptions: canAcceptSubscriptions(caseData),
        
        // Utilities
        getCaseLockReason: () => getCaseLockReason(caseData),
        getCaseStatusMessage: () => getCaseStatusMessage(caseData)
    };
};
