import { gql } from '@apollo/client';

export const UPDATE_CASE_ISIN = gql`
    mutation UpdateCaseIsin($id: uuid!, $data: caseisins_set_input!) {
        update_caseisins_by_pk(pk_columns: { id: $id }, _set: $data) {
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
                eventdate
                interestrate
                isinid
                status
                type
            }
        }
    }
`;
