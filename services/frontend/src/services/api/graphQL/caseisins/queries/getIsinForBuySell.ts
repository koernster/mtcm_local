import { gql } from '@apollo/client';

export const GET_ISIN_FOR_BUYSELL = gql`
  query GetIsinsForBuySell($id: uuid!) {
    caseisins(where: {id: {_eq: $id}}) {
      id
      isinnumber
      currency {
        currencyname
        currencyshortname
      }
      issueprice
      case {
        issuedate
        maturitydate
        copontype {
          id
          typename
        }
        coponfrequency {
          frequency
        }
      }
      couponinterests(where: {couponstatus: {id: {_eq: 1}}}) {
        id
        eventdate
        interestrate
        status
      }
    }
  }
`;