// Utility functions for Buy/Sell calculations

import { CouponFrequencies } from "../types/CouponFrequencies";
import { CouponInterest } from "../services/api/graphQL/couponinterest/types/couponinterest";

export const couponPaymentDates = (issueDate: Date, maturityDate: Date, couponFrequency: CouponFrequencies): Date[] => {
    const getNextDate = (date: Date, freq: CouponFrequencies): Date => {
        const newDate = new Date(date);
        switch (freq) {
            case CouponFrequencies.Monthly:
                newDate.setMonth(newDate.getMonth() + 1);
                break;
            case CouponFrequencies.Quarterly:
                newDate.setMonth(newDate.getMonth() + 3);
                break;
            case CouponFrequencies.SemiAnnual:
                newDate.setMonth(newDate.getMonth() + 6);
                break;
            case CouponFrequencies.Annually:
                newDate.setFullYear(newDate.getFullYear() + 1);
                break;
            case CouponFrequencies.Weekly:
                newDate.setDate(newDate.getDate() + 7);
                break;
            default:
                throw new Error('Invalid coupon frequency');
        }
        
        // // Adjust if newdate is weekend (Saturday/Sunday) then move to next day
        if (newDate.getDay() === 6) { // Saturday
            newDate.setDate(newDate.getDate() + 2);
        } else if (newDate.getDay() === 0) { // Sunday
            newDate.setDate(newDate.getDate() + 1);
        }

        //if new date falls on a holiday, move to next day.
        // This is a placeholder. Actual holiday logic would depend on the specific holidays to consider based on holiday calender API.

        return newDate;
    };

    const payments: Date[] = [];
    let currentDate = new Date(issueDate);

    while (currentDate <= maturityDate) {
        payments.push(new Date(currentDate));
        currentDate = getNextDate(currentDate, couponFrequency);
    }

    // Add maturity date if the last payment date is not the maturity date
    if (payments.length > 0 && payments[payments.length - 1].getTime() !== maturityDate.getTime()) {
        payments.push(new Date(maturityDate));
    }

    return payments;
};

// Excel-like DAYS360 function
export const days360 = (startDate: Date, endDate: Date): number => {
    const d1 = startDate.getDate();
    const m1 = startDate.getMonth() + 1; // JavaScript months are 0-indexed
    const y1 = startDate.getFullYear();
    
    const d2 = endDate.getDate();
    const m2 = endDate.getMonth() + 1;
    const y2 = endDate.getFullYear();
    
    // DAYS360 US/NASD method (30/360)
    let day1 = d1;
    let day2 = d2;
    
    if (day1 === 31) {
        day1 = 30;
    }
    
    if (day2 === 31 && day1 >= 30) {
        day2 = 30;
    }
    
    return (y2 - y1) * 360 + (m2 - m1) * 30 + (day2 - day1);
};

// Find the closest coupon payment date before or on the value date
export const findPreviousCouponDate = (valueDate: Date, couponDates: Date[]): Date | null => {
    const sortedDates = couponDates.sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] <= valueDate) {
            return sortedDates[i];
        }
    }
    
    return null;
};

// Find the applicable coupon interest for a trade based on date range
export const findApplicableCouponInterest = (
    tradeDate: string | Date,
    valueDate: string | Date,
    couponInterests: CouponInterest[]
): CouponInterest | null => {
    if (!tradeDate || !valueDate || !couponInterests.length) return null;
    
    const tradeDateObj = new Date(tradeDate);
    const valueDateObj = new Date(valueDate);
    
    // Find coupon interest where event date falls between trade date and value date
    const applicableInterest = couponInterests.find(ci => {
        if (!ci.eventdate) return false;
        
        const eventDateObj = new Date(ci.eventdate);
        return eventDateObj >= tradeDateObj && eventDateObj <= valueDateObj;
    });
    
    // If no interest found in the date range, return the most recent one before the value date
    if (!applicableInterest) {
        const sortedInterests = couponInterests
            .filter(ci => ci.eventdate && new Date(ci.eventdate) <= valueDateObj)
            .sort((a, b) => new Date(b.eventdate!).getTime() - new Date(a.eventdate!).getTime());
        
        return sortedInterests[0] || null;
    }
    
    return applicableInterest;
};

// Calculate days accrued
export const calculateDaysAccrued = (
    valueDate: string,
    issueDate: string,
    maturityDate: string,
    couponFreq: string
): number => {
    if (!valueDate || !issueDate || !maturityDate || !couponFreq) return 0;
    
    try {
        const vDate = new Date(valueDate);
        const iDate = new Date(issueDate);
        const mDate = new Date(maturityDate);
        
        const couponDates = couponPaymentDates(iDate, mDate, couponFreq as CouponFrequencies);
        const previousCouponDate = findPreviousCouponDate(vDate, couponDates);
        
        if (!previousCouponDate) return 0;
        
        return days360(previousCouponDate, vDate);
    } catch (error) {
        console.error('Error calculating days accrued:', error);
        return 0;
    }
};

// Calculate accrued interest
export const calculateAccruedInterest = (
    daysAccrued: number,
    notional: number,
    couponRate: number,
    dayCount: number = 360, // Default to 360 for bonds
    tradeDate?: string | Date,
    valueDate?: string | Date,
    couponInterests?: CouponInterest[]
): number => {
    if (daysAccrued === 0 || !notional) return 0;
    
    let effectiveCouponRate = couponRate;
    
    // If coupon interests are provided and we have trade/value dates, find the applicable rate
    if (tradeDate && valueDate && couponInterests?.length) {
        const applicableInterest = findApplicableCouponInterest(tradeDate, valueDate, couponInterests);
        if (applicableInterest) {
            effectiveCouponRate = applicableInterest.interestrate;
        }
    }
    
    if (!effectiveCouponRate) return 0;
    
    return (daysAccrued * notional * (effectiveCouponRate / 100)) / dayCount;
};

// Calculate dirty price
export const calculateDirtyPrice = (
    settlementAmount: number,
    notional: number
): number => {
    if (!settlementAmount || !notional || notional === 0) return 0;
    
    return (settlementAmount / notional) * 100;
};

// Calculate settlement amount
export const calculateSettlementAmount = (
    priceClean: number,
    notional: number,
    transactionFeeCurrency: number,
    accruedCurrency: number
): number => {
    if (!priceClean || !notional) return 0;
    
    const grossAmount = (priceClean / 100) * notional;
    return grossAmount + (transactionFeeCurrency || 0) + (accruedCurrency || 0);
};

// Calculate transaction fee in currency
export const calculateTransactionFeeCurrency = (
    notional: number,
    tranFee: number
): number => {
    if (!notional || !tranFee) return 0;
    
    return notional * tranFee;
};
