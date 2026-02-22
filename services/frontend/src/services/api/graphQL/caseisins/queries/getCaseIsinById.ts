import { gql } from '@apollo/client';

export const GET_CASE_ISIN_BY_ID = gql`
    query GetCaseIsinById($id: uuid!) {
        caseisins_by_pk(id: $id) {
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
                couponrate
            }
        }
    }
`;
