import { gql } from '@apollo/client';

export const INSERT_COMPANY = gql`
  mutation InsertCompany($id: uuid!, $hbid: String!, $companyname: String!, $clienttype: Boolean) {
    insert_companies_one(object: {
      id: $id,
      hbid: $hbid,
      companyname: $companyname,
      clienttype: $clienttype
    }) {
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
