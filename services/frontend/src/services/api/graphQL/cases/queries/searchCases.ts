import { gql } from '@apollo/client';

export const SEARCH_CASES = gql`
  query SearchCases($search: String, $offset: Int!, $limit: Int!) {
    cases(
      where: {
        _or: [
          { compartmentname: { _ilike: $search } },
          { company: { companyname: { _ilike: $search } } }
        ]
      }
      offset: $offset
      limit: $limit
      order_by: {maturitydate: desc_nulls_last}
    ) {
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
