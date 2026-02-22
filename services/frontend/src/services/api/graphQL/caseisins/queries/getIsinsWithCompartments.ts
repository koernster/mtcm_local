import { gql } from '@apollo/client';

export const GET_ISINS_WITH_COMPARTMENTS = gql`
    query GetIsinsWithCompartments($offset: Int!, $limit: Int!) {
        caseisins(
            where: {case: {compartmentstatusid: {_eq: 9}}}
            offset: $offset
            limit: $limit
            order_by: { isinnumber: asc }
        ) {
            id
            isinnumber
            case {
                id
                compartmentname
            }
        }
    }
`;

export const GET_FILTERED_ISINS_WITH_COMPARTMENTS = gql`
    query GetFilteredIsinsWithCompartments($filter: String!, $offset: Int!, $limit: Int!) {
        caseisins(
            where: {
                case: {compartmentstatusid: {_eq: 9}}
                _or: [
                    { isinnumber: { _ilike: $filter } }
                    { case: { compartmentname: { _ilike: $filter } } }
                ]
            }
            offset: $offset
            limit: $limit
            order_by: { isinnumber: asc }
        ) {
            id
            isinnumber
            case {
                id
                compartmentname
            }
        }
    }
`;