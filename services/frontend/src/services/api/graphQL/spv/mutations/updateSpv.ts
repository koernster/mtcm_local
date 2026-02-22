import { gql } from '@apollo/client';

export const UPDATE_SPV = gql`
  mutation UpdateSpv(
    $id: uuid!
    $spvtitle: String
    $spvdescription: String
    $logo: bytea
  ) {
    update_spvs_by_pk(
      pk_columns: { id: $id }
      _set: {
        spvtitle: $spvtitle
        spvdescription: $spvdescription
        logo: $logo
      }
    ) {
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
    $accountname: String
    $beneficiarybank: String
    $correspondent_aba: String
    $correspondent_swift: String
    $correspondentbank: String
    $iban: String
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
        accountname: $accountname
        beneficiarybank: $beneficiarybank
        correspondent_aba: $correspondent_aba
        correspondent_swift: $correspondent_swift
        correspondentbank: $correspondentbank
        iban: $iban
      }
    ) {
      id
      accountname
      beneficiarybank
      correspondent_aba
      correspondent_swift
      correspondentbank
      iban
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
    $accountname: String
    $beneficiarybank: String
    $correspondent_aba: String
    $correspondent_swift: String
    $correspondentbank: String
    $iban: String
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
        accountname: $accountname
        beneficiarybank: $beneficiarybank
        correspondent_aba: $correspondent_aba
        correspondent_swift: $correspondent_swift
        correspondentbank: $correspondentbank
        iban: $iban
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
    $accountname: String
    $beneficiarybank: String
    $correspondent_aba: String
    $correspondent_swift: String
    $correspondentbank: String
    $iban: String
  ) {
    insert_paymentdetails_one(
      object: {
        id: $id
        accountname: $accountname
        beneficiarybank: $beneficiarybank
        correspondent_aba: $correspondent_aba
        correspondent_swift: $correspondent_swift
        correspondentbank: $correspondentbank
        iban: $iban
      }
      on_conflict: {
        constraint: paymentdetails_pkey
        update_columns: [accountname, beneficiarybank, correspondent_aba, correspondent_swift, correspondentbank, iban]
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
