import { gql } from '@apollo/client';

export const GET_CASE_ISINS = gql`
    query GetCaseIsins($caseid: uuid!) {
        caseisins(where: { caseid: { _eq: $caseid } }) {
            id
            caseid
            isinnumber
            valoren
            issuesize
            currencyid
            currency {
                id
                currencyshortname
            }
            issueprice
            couponinterests {
                id
                interestrate
            }
        }
    }
`;

export const GET_CASE_ISINS_SHORT = gql`
    query GetCaseIsinsShort($caseid: uuid!) {
        caseisins(where: { caseid: { _eq: $caseid } }) {
            id
            isinnumber
        }
    }
`;
