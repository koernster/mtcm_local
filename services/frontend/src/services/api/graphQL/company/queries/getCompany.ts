import { gql } from '@apollo/client';

export const GET_COMPANY_BY_HBID = gql`
  query GetCompanyByHBID($hbid: String!) {
    companies(where: { hbid: { _eq: $hbid } }) {
      id
      hbid
      companyname
      clienttype
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

export const GET_COMPANY_BY_ID = gql`
  query GetCompanyById($id: uuid!) {
    companies_by_pk(id: $id) {
      id
      hbid
      companyname
      clienttype
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
