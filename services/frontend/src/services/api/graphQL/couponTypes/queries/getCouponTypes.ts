import { gql } from '@apollo/client';

export const GET_COUPON_TYPES = gql`
  query GetCoponTypes {
    copontypes {
      id
      typename
    }
  }
`;
