import { gql } from '@apollo/client';

export const INSERT_COUPON_INTEREST = gql`
  mutation InsertCouponInterest(
    $id: uuid!,
    $isinId: uuid!, 
    $interestRate: numeric!,
    $couponRate: numeric,
    $eventDate: date,
    $status: Int,
    $type: uuid
  ) {
    insert_couponinterest_one(object: {
      id: $id,
      isinid: $isinId,
      interestrate: $interestRate,
      couponrate: $couponRate,
      eventdate: $eventDate,
      status: $status,
      type: $type
    }) {
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