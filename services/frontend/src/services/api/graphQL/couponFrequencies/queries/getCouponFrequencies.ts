import { gql } from '@apollo/client';

export const GET_COUPON_FREQUENCIES = gql`
  query GetCoponFrequencies {
    coponfrequencies {
      id
      frequency
    }
  }
`;
