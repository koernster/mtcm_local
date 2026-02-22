import { gql } from '@apollo/client';

export const UPDATE_SPV = gql`
  mutation UpdateSpv(
    $id: uuid!
    $companyid: String
    $spvtitle: String
    $spvdescription: String
    $logo: bytea
  ) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: {
        companyid: $companyid
        spvtitle: $spvtitle
        spvdescription: $spvdescription
        logo: $logo
      }
    ) {
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

export const UPDATE_SPV_WITH_ADDRESS = gql`
  mutation UpdateSpvWithAddress(
    $id: uuid!
    $spvtitle: String
    $spvdescription: String
    $addressId: uuid!
    $addressline1: String
    $addressline2: String
    $city: String
    $country: String
    $postalcode: String
    $email: String
    $phone: String
    $website: String
  ) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: {
        spvtitle: $spvtitle
        spvdescription: $spvdescription
      }
    ) {
      id
      spvtitle
      spvdescription
    }
    
    update_address_by_pk(
      pk_columns: { id: $addressId }
      _set: {
        addressline1: $addressline1
        addressline2: $addressline2
        city: $city
        country: $country
        postalcode: $postalcode
        email: $email
        phone: $phone
        website: $website
      }
    ) {
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
  }
`;

export const UPDATE_SPV_WITH_PAYMENT = gql`
  mutation UpdateSpvWithPayment(
    $id: uuid!
    $spvtitle: String
    $spvdescription: String
    $paymentDetailId: uuid!
    $iban: String
    $bankname: String
    $address: String
    $beneficiary: String
    $bicintermediary: String
    $swift: String
  ) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: {
        spvtitle: $spvtitle
        spvdescription: $spvdescription
      }
    ) {
      id
      spvtitle
      spvdescription
    }
    
    update_paymentdetails_by_pk(
      pk_columns: { id: $paymentDetailId }
      _set: {
        iban: $iban
        bankname: $bankname
        address: $address
        beneficiary: $beneficiary
        bicintermediary: $bicintermediary
        swift: $swift
      }
    ) {
      id
      iban
      bankname
      address
      beneficiary
      bicintermediary
      swift
    }
  }
`;

export const UPDATE_SPV_FULL = gql`
  mutation UpdateSpvFull(
    $id: uuid!
    $spvtitle: String
    $spvdescription: String
    $addressId: uuid!
    $addressline1: String
    $addressline2: String
    $city: String
    $country: String
    $postalcode: String
    $email: String
    $phone: String
    $website: String
    $paymentDetailId: uuid!
    $iban: String
    $bankname: String
    $address: String
    $beneficiary: String
    $bicintermediary: String
    $swift: String
  ) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: {
        spvtitle: $spvtitle
        spvdescription: $spvdescription
      }
    ) {
      id
      spvtitle
      spvdescription
    }
    
    update_address_by_pk(
      pk_columns: { id: $addressId }
      _set: {
        addressline1: $addressline1
        addressline2: $addressline2
        city: $city
        country: $country
        postalcode: $postalcode
        email: $email
        phone: $phone
        website: $website
      }
    ) {
      id
    }
    
    update_paymentdetails_by_pk(
      pk_columns: { id: $paymentDetailId }
      _set: {
        iban: $iban
        bankname: $bankname
        address: $address
        beneficiary: $beneficiary
        bicintermediary: $bicintermediary
        swift: $swift
      }
    ) {
      id
    }
  }
`;

// Upsert mutations for handling cases where address/payment records don't exist

export const UPSERT_ADDRESS = gql`
  mutation UpsertAddress(
    $id: uuid!
    $addressline1: String
    $addressline2: String
    $city: String
    $country: String
    $postalcode: String
    $email: String
    $phone: String
    $website: String
  ) {
    insert_address_one(
      object: {
        id: $id
        addressline1: $addressline1
        addressline2: $addressline2
        city: $city
        country: $country
        postalcode: $postalcode
        email: $email
        phone: $phone
        website: $website
      }
      on_conflict: {
        constraint: address_pkey
        update_columns: [addressline1, addressline2, city, country, postalcode, email, phone, website]
      }
    ) {
      id
    }
  }
`;

export const UPSERT_PAYMENT_DETAIL = gql`
  mutation UpsertPaymentDetail(
    $id: uuid!
    $iban: String
    $bankname: String
    $address: String
    $beneficiary: String
    $bicintermediary: String
    $swift: String
  ) {
    insert_paymentdetails_one(
      object: {
        id: $id
        iban: $iban
        bankname: $bankname
        address: $address
        beneficiary: $beneficiary
        bicintermediary: $bicintermediary
        swift: $swift
      }
      on_conflict: {
        constraint: paymentdetails_pkey
        update_columns: [iban, bankname, address, beneficiary, bicintermediary, swift]
      }
    ) {
      id
    }
  }
`;

export const UPDATE_SPV_LINK_ADDRESS = gql`
  mutation UpdateSpvLinkAddress($id: uuid!, $addressId: uuid!) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: { addressid: $addressId }
    ) {
      id
    }
  }
`;

export const UPDATE_SPV_LINK_PAYMENT = gql`
  mutation UpdateSpvLinkPayment($id: uuid!, $paymentDetailId: uuid!) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: { paymentdetailid: $paymentDetailId }
    ) {
      id
    }
  }
`;
