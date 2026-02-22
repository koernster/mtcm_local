import { gql } from '@apollo/client';

export const GET_CASES = gql`
  query GetCasesList($offset: Int!, $limit: Int!) {
    cases(offset: $offset, limit: $limit, order_by: {maturitydate: desc_nulls_last}) {
      id
      companyid
      compartmentname
      maturitydate
      compartmentstatusid
      company {
        companyname
      }
    }
  }
`;
