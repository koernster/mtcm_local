import { gql } from '@apollo/client';

export const SEARCH_CUSTODIANS = gql`
  query SearchCustodians($search: String) {
    custodians(where: { custodian: { _ilike: $search } }) {
      id
      custodian
    }
  }
`;

export const CREATE_CUSTODIAN = gql`
  mutation CreateCustodian($id: uuid!, $custodian: String!) {
    insert_custodians_one(object: { id: $id, custodian: $custodian }) {
      id
      custodian
    }
  }
`;
