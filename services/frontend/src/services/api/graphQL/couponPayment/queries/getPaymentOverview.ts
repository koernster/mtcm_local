import { gql } from '@apollo/client';

export const GET_PAYMENT_OVERVIEW_BY_CASE = gql`
  query GetPaymentOverview($caseId: uuid) {
    cases(where: {id: {_eq: $caseId}}) {
        id
        compartmentname
        issuedate
        maturitydate
        issueprice
        coponfrequency {
          frequency
        }
        caseisins {
          id
          isinnumber
          currency {
            currencyshortname
          }
          couponpayments {
              id
              startdate
              enddate
              days
              interestrate
              accruedamount
              paidinterest
          }
          couponinterests {
            interestrate
            type
          }
        }
        spv {
          id
          spvtitle
          spvdescription
          paymentdetail {
            iban
            correspondentbank
            correspondent_swift
            correspondent_aba
            beneficiarybank
            accountname
            swift
          }
          address {
            addressline1
            addressline2
            city
            country
            postalcode
            phone
            email
          }
        }
        company {
          id
          companyname
          hbid
          clienttype
          addressByAddressid {
            addressline1
            addressline2
            city
            state_or_province
            country
            postalcode
            phone
            email
            website
          }
        }
    }
}`;

export const GET_LOAN_BALANCE_OVERVIEW_BY_ISIN = gql`
  query GetLoanBalanceOverview($p_isinid: uuid!) {
    trades_history_by_days(args: {p_isinid: $p_isinid}) {
      loan_cell
      net_notional
      valuedate
    }
  }
`;
