import { gql } from '@apollo/client';

export const INSERT_CASE_ISIN = gql`
    mutation InsertCaseIsin(
        $id: uuid!,
        $caseid: uuid!,
        $isinnumber: String!,
        $valoren: String!,
        $issuesize: String!,
        $currencyid: uuid,
        $issueprice: numeric!
    ) {
        insert_caseisins_one(object: {
            id: $id,
            caseid: $caseid,
            isinnumber: $isinnumber,
            valoren: $valoren,
            issuesize: $issuesize,
            currencyid: $currencyid,
            issueprice: $issueprice
        }) {
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
        }
    }
`;
