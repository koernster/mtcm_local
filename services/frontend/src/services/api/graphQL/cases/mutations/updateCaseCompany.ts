import { gql } from '@apollo/client';

export const UPDATE_CASE_COMPANY = gql`
  mutation UpdateCaseCompany($id: uuid!, $companyid: uuid!) {
    update_cases_by_pk(
      pk_columns: { id: $id }
      _set: { companyid: $companyid }
    ) {
      id
      companyid
      company {
        id
        companyname
      }
    }
  }
`;
