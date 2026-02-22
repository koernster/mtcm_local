import { gql } from '@apollo/client';

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany($id: uuid!, $data: companies_set_input!) {
    update_companies_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      hbid
      companyname
      clienttype
      addressByAddressid {
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

// Transaction-based mutation for updating company with address (ACID compliant)
export const UPDATE_COMPANY_WITH_ADDRESS = gql`
  mutation UpdateCompanyWithAddress(
    $companyId: uuid!
    $companyData: companies_set_input!
    $addressId: uuid!
    $addressData: address_insert_input!
    $addressUpdateData: address_set_input!
    $hasAddressId: Boolean!
  ) {
    # Insert new address if no addressId exists
    insert_address_one(
      object: $addressData
    ) @skip(if: $hasAddressId) {
      id
    }
    
    # Update existing address if addressId exists
    update_address_by_pk(
      pk_columns: { id: $addressId }
      _set: $addressUpdateData
    ) @include(if: $hasAddressId) {
      id
    }
    
    # Update company (with new addressid if address was created)
    update_companies_by_pk(
      pk_columns: { id: $companyId }
      _set: $companyData
    ) {
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
