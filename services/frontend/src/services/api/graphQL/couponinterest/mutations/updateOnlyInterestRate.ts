import { gql } from '@apollo/client';

export const UPDATE_ONLY_INTEREST_RATE = gql`
  mutation UpdateCouponInterest(
    $id: uuid!,
    $interestRate: numeric!
  ) {
    update_couponinterest_by_pk(
      pk_columns: { id: $id },
      _set: { 
        interestrate: $interestRate
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
