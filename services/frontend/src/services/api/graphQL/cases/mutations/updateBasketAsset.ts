import { gql } from '@apollo/client';

export const UPDATE_BASKET_ASSET = gql`
  mutation UpdateBasketAsset($id: uuid!, $data: case_assetbasket_set_input!) {
    update_case_assetbasket_by_pk(pk_columns: {id: $id}, _set: $data) {
      id
      caseid
      assetname
      assetvalue
      valuetype
    }
  }
`;
