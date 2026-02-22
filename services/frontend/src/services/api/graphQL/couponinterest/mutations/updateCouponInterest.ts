import { gql } from '@apollo/client';

export const UPDATE_COUPON_INTEREST = gql`
  mutation UpdateCouponInterest(
    $id: uuid!,
    $interestRate: numeric!,
    $couponRate: numeric,
    $eventDate: date,
    $status: Int,
    $type: uuid
  ) {
    update_couponinterest_by_pk(
      pk_columns: { id: $id },
      _set: { 
        interestrate: $interestRate,
        couponrate: $couponRate,
        eventdate: $eventDate,
        status: $status,
        type: $type
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
