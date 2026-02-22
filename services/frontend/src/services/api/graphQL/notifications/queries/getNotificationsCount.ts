import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS_COUNT = gql`
  query NotificationsCount($_status: [Int!], $_target: [String!]) {
    notificationtargets_aggregate(where: {status: {_in: $_status}, target: {_in: $_target}}) {
      aggregate {
        count
      }
    }
  }
`;
