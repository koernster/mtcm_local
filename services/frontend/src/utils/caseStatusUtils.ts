import { CompartmentStatus } from '../types/CompartmentStatus';
import { Case } from '../services/api/graphQL/cases/types/case';

/**
 * Determines if a case is in a freezed/locked state based on its compartment status
 * @param caseData - The case data object
 * @returns boolean indicating if the case is freezed/locked
 */
export const isCaseFreezedOrLocked = (caseData: Case | null | undefined): boolean => {
    if (!caseData) {
        return false;
    }

    // Check compartment status for freeze/lock conditions
    switch (caseData.compartmentstatusid) {
        case CompartmentStatus.CASE_FREEZED:
            return true; // ISIN can be edited, but other fields are locked
        case CompartmentStatus.SUBSCRIPTION:
            return true; // ISIN cannot be edited, ready for subscriptions
        case CompartmentStatus.ISSUED:
            return true; // Entire compartment is readonly
        default:
            return false;
    }
};

/**
 * Determines if a case is in the ISSUED state
 * @param caseData - The case data object
 * @returns boolean indicating if the case is issued
 */
export const isCaseIssued = (caseData: Case | null | undefined): boolean => {
    if (!caseData) {
        return false;
    }
    return caseData.compartmentstatusid === CompartmentStatus.ISSUED;
}

/**
 * Determines if ISIN editing is allowed (only in CASE_FREEZED state)
 * @param caseData - The case data object
 * @returns boolean indicating if ISIN can be edited
 */
export const canEditIsin = (caseData: Case | null | undefined): boolean => {
    if (!caseData) {
        return false;
    }

    return (
        caseData.compartmentstatusid === CompartmentStatus.PRD_SETUP ||
        caseData.compartmentstatusid === CompartmentStatus.CASE_FREEZED
    );
};

/**
 * Determines if the case can accept subscriptions (SUBSCRIPTION state)
 * @param caseData - The case data object
 * @returns boolean indicating if subscriptions are allowed
 */
export const canAcceptSubscriptions = (caseData: Case | null | undefined): boolean => {
    if (!caseData) {
        return false;
    }

    return caseData.compartmentstatusid === CompartmentStatus.SUBSCRIPTION;
};

/**
 * Gets the reason why a case is locked/freezed based on compartment status
 * @param caseData - The case data object
 * @returns string describing the reason for the lock/freeze state
 */
export const getCaseLockReason = (caseData: Case | null | undefined): string | null => {
    if (!caseData) {
        return null;
    }

    switch (caseData.compartmentstatusid) {
        case CompartmentStatus.CASE_FREEZED:
            return 'Product setup is frozen. ISINs are editable.';
        case CompartmentStatus.SUBSCRIPTION:
            return 'Deal is accepting subscriptions.';
        case CompartmentStatus.ISSUED:
            return 'Deal has been issued and is read-only.';
        default:
            return null;
    }
};

/**
 * Gets the message of the case based on its compartment status
 * @param caseData - The case data object
 * @returns string describing the message for the case state
 */
export const getCaseStatusMessage = (caseData: Case | null | undefined): string | null => {
    if (!caseData) {
        return null;
    }

    if(isCaseFreezedOrLocked(caseData) && caseData?.compartmentstatusid === CompartmentStatus.SUBSCRIPTION) {
        //calculates days difference caseData.issuedate - currentDate
        const currentDate = new Date();
        const issueDate = new Date(caseData.issuedate);
        const timeDiff = issueDate.getTime() - currentDate.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (dayDiff < 0) {
            return 'Warning: The Deal in Subscription state has passed its Issue Date. Work with support to manually issue the deal.';
        } else {
            const months = Math.floor(dayDiff / 30);
            const remainingDays = dayDiff % 30;
            
            let timeText = '';
            if (months > 0) {
                timeText = `${months} month${months > 1 ? 's' : ''}`;
                if (remainingDays > 0) {
                    timeText += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                }
            } else {
                timeText = `${dayDiff} day${dayDiff > 1 ? 's' : ''}`;
            }

            return `This Deal will be Issued in ${timeText}.`;
        }
    }

    return null;
}