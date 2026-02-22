import { gql } from '@apollo/client';

export const INSERT_CASE = gql`
  mutation InsertCase($id: uuid!, $compartmentname: String!, $compartmentstatusid: Int!) {
    insert_cases_one(object: {
      id: $id,
      compartmentname: $compartmentname,
      compartmentstatusid: $compartmentstatusid
    }) {
      id
      compartmentname
      compartmentstatusid
      maturitydate
      company {
        companyname
      }
    }
  }
`;
