export interface CouponInfo {
    //header
    spv: string;
    compartmentName: string;
    ISIN: string;
    
    //table body
    securityIssueDate: string;
    loanIssueDate: string;
    securityMaturityDate: string;
    loanMaturityDate: string;
    securityIssuePrice: string;
    loanIssuePrice: string;
    securityRedemptionPrice: string;
    loanRedemptionPrice: string;
    securityCouponInterest: string;
    loanCouponInterest: string;
    securityFrequency: string;
    loanFrequency: string;
    securityDayCount: string;
    loanDayCount: string;
}
