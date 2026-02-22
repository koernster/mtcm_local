import { gql } from '@apollo/client';

export const GET_CASES_BY_COMPARTMENT_STATUS = gql`
    query GetCasesByCompartmentStatus($statusId: Int!, $offset: Int!, $limit: Int!) {
        cases(
            where: { compartmentstatusid: { _eq: $statusId } }
            order_by: { updatedat: desc }
            offset: $offset
            limit: $limit
        ) {
            id
            compartmentname
            productsetupstatusid
            updatedat
        }
        cases_aggregate(where: { compartmentstatusid: { _eq: $statusId } }) {
            aggregate {
                count
            }
        }
        status(where: { statustype: { _eq: 0 } }) {
            id
            status
            description
            statustype
        }
    }
`;
