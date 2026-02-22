import { gql } from '@apollo/client';

export const GET_COUPON_INTEREST_BY_ISIN = gql`
  query GetCouponInterestByIsin($isinId: uuid!) {
    couponinterest(where: { isinid: { _eq: $isinId } }) {
      id
      isinid
      interestrate
      couponrate
      eventdate
      status
      type
    }
  }
`;
