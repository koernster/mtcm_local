import { gql } from '@apollo/client';

export const UPDATE_ONLY_COUPON_RATE = gql`
  mutation UpdateCouponRate(
    $id: uuid!,
    $couponRate: numeric!
  ) {
    update_couponinterest_by_pk(
      pk_columns: { id: $id },
      _set: { 
        couponrate: $couponRate
      }
    ) {
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
