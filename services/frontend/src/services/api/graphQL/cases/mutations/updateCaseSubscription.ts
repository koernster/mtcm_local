import { gql } from '@apollo/client';

export const UPDATE_CASE_SUBSCRIPTION = gql`
  mutation UpdateCaseSubscription($id: uuid!, $data: casesubscriptiondata_set_input!) {
    update_casesubscriptiondata_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      caseid
      distributionpaidbyinvs
      salesfeepaidbyinves
      salesnotpaidissuedate
      salesnotpaidmaturitydate
    }
  }
`;

export const INSERT_CASE_SUBSCRIPTION = gql`
  mutation InsertCaseSubscription($data: casesubscriptiondata_insert_input!) {
    insert_casesubscriptiondata_one(object: $data) {
      id
      caseid
      distributionpaidbyinvs
      salesfeepaidbyinves
      salesnotpaidissuedate
      salesnotpaidmaturitydate
    }
  }
`;
