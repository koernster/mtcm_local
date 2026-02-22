import { gql } from '@apollo/client';

export const UPDATE_CASE_FEE = gql`
  mutation UpdateCaseFee($id: uuid!, $data: casefees_set_input!) {
    update_casefees_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      caseid
      setupfee
      setupfeetype
      adminfee
      adminfeetype
      managementfee
      managementfeetype
      salesfee
      salesfeetype
      performancefee
      performancefeetype
      otherfees
      otherfeestype
    }
  }
`;

export const INSERT_CASE_FEE = gql`
  mutation InsertCaseFee($data: casefees_insert_input!) {
    insert_casefees_one(object: $data) {
      id
      caseid
      setupfee
      setupfeetype
      adminfee
      adminfeetype
      managementfee
      managementfeetype
      salesfee
      salesfeetype
      performancefee
      performancefeetype
      otherfees
      otherfeestype
    }
  }
`;
