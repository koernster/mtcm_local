import { gql } from '@apollo/client';

export const GET_SPVS = gql`
  query GetSpvs {
    spvs {
      id
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
        accountname
        beneficiarybank
        correspondent_aba
        correspondent_swift
        correspondentbank
        iban
      }
    }
  }
`;
