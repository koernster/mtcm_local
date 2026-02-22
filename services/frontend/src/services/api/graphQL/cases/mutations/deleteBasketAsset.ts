import { gql } from '@apollo/client';

export const DELETE_BASKET_ASSET = gql`
  mutation DeleteBasketAsset($id: uuid!) {
    delete_case_assetbasket_by_pk(id: $id) {
      id
    }
  }
`;
