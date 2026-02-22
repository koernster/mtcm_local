import { gql } from '@apollo/client';

export const INSERT_BASKET_ASSET = gql`
  mutation InsertBasketAsset($data: case_assetbasket_insert_input!) {
    insert_case_assetbasket_one(object: $data) {
      id
      caseid
      assetname
      assetvalue
      valuetype
    }
  }
`;
