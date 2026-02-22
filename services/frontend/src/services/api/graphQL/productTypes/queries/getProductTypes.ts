import { gql } from '@apollo/client';

export const GET_PRODUCT_TYPES = gql`
  query GetProductTypes {
    producttypes {
      id
      typename
    }
  }
`;
