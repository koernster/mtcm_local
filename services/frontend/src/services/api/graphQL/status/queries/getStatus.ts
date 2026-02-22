import { gql } from '@apollo/client';

export const GET_STATUS = gql`
    query GetStatus {
        status {
            id
            status
            description
            statustype
        }
    }
`;
