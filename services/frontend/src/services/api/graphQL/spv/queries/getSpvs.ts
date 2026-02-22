import { gql } from '@apollo/client';

export const GET_SPVS = gql`
  query GetSpvs {
    spvs {
      id
      companyid
      spvdescription
      spvtitle
      logo
      address {
        id
        addressline1
        addressline2
        city
        country
        postalcode
        email
        phone
        website
      }
      paymentdetail {
        id
        iban
        bankname
        address
        beneficiary
        bicintermediary
        swift
      }
    }
  }
`;
