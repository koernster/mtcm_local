import { gql } from '@apollo/client';

export const INSERT_SPV = gql`
  mutation InsertSpv(
    $id: uuid!
    $companyid: String
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
      companyid: $companyid
      spvtitle: $spvtitle
      spvdescription: $spvdescription
      logo: $logo
      addressid: $addressId
      paymentdetailid: $paymentDetailId
    }) {
      id
      companyid
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
