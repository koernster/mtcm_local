import { gql } from '@apollo/client';

export const DELETE_COUPON_INTEREST = gql`
  mutation DeleteCouponInterest($id: uuid!) {
    delete_couponinterest_by_pk(id: $id) {
      id
      couponrate
    }
  }
`;
