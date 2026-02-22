import { gql } from '@apollo/client';

export const DELETE_CASE_ISIN = gql`
    mutation DeleteCaseIsin($id: uuid!) {
        delete_caseisins_by_pk(id: $id) {
            id
            caseid
            isinnumber
        }
    }
`;
