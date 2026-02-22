import { Company } from "../../company";
import { Spv } from "../../spv";

export interface InterestCouponPayment {
    isinId: string;
    isinNumber: string;
    currency:  string;
    compartmentName: string;
    issueDate: string;
    maturityDate: string;
    issuePrice: number;
    couponFrequency: string;
    company: Company;
    spvData: Spv;
    paymentOverview: PaymentOverview[];
    loanBalanceOverview: LoanBalanceOverview[];
    couponInterest: CouponInterest;
}

export interface PaymentOverview {
    id: string;
    startDate: string;
    endDate: string;
    interestRate: number;
    amount: number;
    paymentDate: string;
    paidInterest: number;
    currency: string;
}

export interface LoanBalanceOverview {
    loanCell: string;
    date: Date;
    amount: number;
}

export interface CouponInterest {
    interestRate: number;
    type: string;
}