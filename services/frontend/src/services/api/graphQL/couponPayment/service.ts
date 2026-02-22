import client from "../client";
import { GET_LOAN_BALANCE_OVERVIEW_BY_ISIN, GET_PAYMENT_OVERVIEW_BY_CASE } from "./queries/getPaymentOverview";
import { InterestCouponPayment } from "./types/couponpayment";

class CouponPaymentService {
    private static instance: CouponPaymentService;

    private constructor() {}

    public static getInstance(): CouponPaymentService {
        if (!CouponPaymentService.instance) {
            CouponPaymentService.instance = new CouponPaymentService();
        }
        return CouponPaymentService.instance;
    }

    // Add methods for coupon payment operations here
    public async getCouponPaymentsByCaseId(caseId: string): Promise<InterestCouponPayment[]> {
        const payments: InterestCouponPayment[] = [];

        // Fetch payment overview by case ID
        const { data } = await client.query<any, any>({
            query: GET_PAYMENT_OVERVIEW_BY_CASE,
            variables: { caseId },
            fetchPolicy: 'network-only'
        });

        if(!data || !data.cases || data.cases.length === 0 || data.cases[0].caseisins.length === 0){
            return [];
        } else{
            const spvData = data.cases[0].spv;
            const company = data.cases[0].company;
            const compartmentName = data.cases[0].compartmentname;
            const issueDate = data.cases[0].issuedate;
            const maturityDate = data.cases[0].maturitydate;
            const issuePrice = data.cases[0].issueprice;
            const couponFrequency = data.cases[0].coponfrequency?.frequency || '';
            for(const isin of data.cases[0].caseisins){
                //get loan balance overview here.
                const { data } = await client.query<any, any>({
                            query: GET_LOAN_BALANCE_OVERVIEW_BY_ISIN,
                            variables: { p_isinid: isin.id },
                            fetchPolicy: 'network-only'
                        });
                
                //push payment overview and loan balance overview
                const paymentOverview = isin.couponpayments.map((payment: any) => ({
                    id: payment.id,
                    startDate: payment.startdate,
                    endDate: payment.enddate,
                    interestRate: payment.interestrate,
                    amount: payment.accruedamount,
                    paymentDate: payment.paymentdate,
                    paidInterest: payment.paidinterest
                }));

                const loanBalanceOverview = data.trades_history_by_days.map((item: any) => ({
                    loanCell: item.loan_cell,
                    date: item.valuedate,
                    amount: item.net_notional
                }));

                payments.push({
                    isinId: isin.id,
                    isinNumber: isin.isinnumber,
                    compartmentName: compartmentName,
                    issueDate: issueDate,
                    maturityDate: maturityDate,
                    issuePrice: issuePrice,
                    couponFrequency: couponFrequency,
                    currency: isin.currency?.currencyshortname || process.env.REACT_APP_DEFAULT_CURRENCY || 'CHF',
                    spvData: spvData,
                    company: company,
                    paymentOverview: paymentOverview,
                    loanBalanceOverview: loanBalanceOverview,
                    couponInterest: {
                        interestRate: isin.couponinterest?.interestrate || 0,
                        type: isin.couponinterest?.type || ''
                    }
                });
            }
        }

        return payments;
    }
}

export default CouponPaymentService;