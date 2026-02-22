import { gql } from '@apollo/client';

/**
 * Query to fetch a single product profile by product type ID
 */
export const GET_PRODUCT_PROFILE = gql`
  query GetProductProfile($productTypeId: uuid!) {
    productprofiles(where: {producttypeid: {_eq: $productTypeId}}) {
      id
      producttypeid
      profileconfig
    }
  }
`;

/**
 * Query to fetch all product profiles (for cache preloading)
 */
export const GET_ALL_PRODUCT_PROFILES = gql`
  query GetAllProductProfiles {
    productprofiles {
      id
      producttypeid
      profileconfig
    }
  }
`;

/**
 * Mutation to upsert (insert or update) a product profile
 */
export const UPSERT_PRODUCT_PROFILE = gql`
  mutation UpsertProductProfile($id: uuid!, $producttypeid: uuid!, $profileconfig: jsonb!) {
    insert_productprofiles_one(
      object: {
        id: $id,
        producttypeid: $producttypeid,
        profileconfig: $profileconfig
      }
      on_conflict: {
        constraint: productprofiles_pkey,
        update_columns: [profileconfig]
      }
    ) {
      id
      producttypeid
      profileconfig
    }
  }
`;

/**
 * Mutation to delete a product profile
 */
export const DELETE_PRODUCT_PROFILE = gql`
  mutation DeleteProductProfile($id: uuid!) {
    delete_productprofiles_by_pk(id: $id) {
      id
    }
  }
`;
