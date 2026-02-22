import { gql } from '@apollo/client';

export const SEARCH_COMPANIES = gql`
  query SearchCompanies($searchTerm: String!, $isUnderlyingClient: Boolean!) {
    companies(
      where: {
        _and: [
          { companyname: { _ilike: $searchTerm } }
          { isunderlyingclient: { _eq: $isUnderlyingClient } }
        ]
      }
    ) {
      id
      hbid
      companyname
      clienttype
      isunderlyingclient
      addressid
      addressByAddressid {
        id
        addressline1
        addressline2
        city
        state_or_province
        country
        postalcode
        phone
        email
        website
      }
    }
  }
`;
