import { gql } from '@apollo/client';

export const GET_PAY_AGENT_TYPES = gql`
    query GetPayAgentTypes {
        payagenttypes {
            id
            typename
        }
    }
`;
