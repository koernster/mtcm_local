import { gql } from '@apollo/client';

export const GET_TOP_10_LATEST_USED = gql`
  query GetTop10LatestUsed {
    cases(
      order_by: { updatedat: desc }
      limit: 10
    ) {
      id
      compartmentname
      compartmentstatusid
      updatedat
      caseisins {
        id
        caseid
        isinnumber
        currencyid
        currency {
          id
          currencyshortname
        }
        issueprice
      }
    }
  }
`;
