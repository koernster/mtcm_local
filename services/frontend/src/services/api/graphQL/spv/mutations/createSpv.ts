import { gql } from '@apollo/client';

export const INSERT_SPV = gql`
  mutation InsertSpv(
    $id: uuid!
    $spvtitle: String!
    $spvdescription: String
    $logo: bytea
    $addressId: uuid!
    $paymentDetailId: uuid!
  ) {
    # Insert address first
    insert_address_one(
      object: {
        id: $addressId
      }
    ) {
      id
    }
    
    # Insert payment detail
    insert_paymentdetails_one(
      object: {
        id: $paymentDetailId
      }
    ) {
      id
    }
    
    # Insert SPV with reference to address and payment detail
    insert_spvs_one(object: {
      id: $id
      spvtitle: $spvtitle
      spvdescription: $spvdescription
      logo: $logo
      addressid: $addressId
      paymentdetailid: $paymentDetailId
    }) {
      id
      spvtitle
      spvdescription
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
