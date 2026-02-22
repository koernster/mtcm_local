import { gql } from '@apollo/client';

export const GET_INVESTMENT_TYPES = gql`
  query GetInvestmentTypes {
    investmenttypes {
      id
      typename
    }
  }
`;
