import { gql } from '@apollo/client';

export const INSERT_COMPANY_WITH_ADDRESS = gql`
  mutation InsertCompanyWithAddress(
    $companyId: uuid!
    $hbid: String!
    $companyname: String!
    $isunderlyingclient: Boolean!
    $addressId: uuid!
  ) {
    # Insert new address first
    insert_address_one(
      object: {
        id: $addressId
      }
    ) {
      id
    }
    
    # Insert company with reference to address
    insert_companies_one(object: {
      id: $companyId
      hbid: $hbid
      companyname: $companyname
      isunderlyingclient: $isunderlyingclient
      addressid: $addressId
    }) {
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
