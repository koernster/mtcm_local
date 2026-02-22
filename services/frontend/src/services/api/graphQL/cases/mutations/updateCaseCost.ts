import { gql } from '@apollo/client';

export const UPDATE_CASE_COST = gql`
  mutation UpdateCaseCost($id: uuid!, $data: casecosts_set_input!) {
    update_casecosts_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      caseid
      operationalcosts
      runningcosts
      payingagentcosts
      auditcosts
      legalcosts
      operationalcosttype
      runningcosttype
      payingagentcosttype
      auditcosttype
      legalcosttype
    }
  }
`;

export const INSERT_CASE_COST = gql`
  mutation InsertCaseCost($data: casecosts_insert_input!) {
    insert_casecosts_one(object: $data) {
      id
      caseid
      operationalcosts
      runningcosts
      payingagentcosts
      auditcosts
      legalcosts
      operationalcosttype
      runningcosttype
      payingagentcosttype
      auditcosttype
      legalcosttype
    }
  }
`;
