import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($_status: [Int!], $_target: [String!]) {
    notifications(where: {notificationtargets: {target: {_in: $_target}, status: {_in: $_status}}}, order_by: {createdat: desc}) {
      id
      title
      message
      createdby
      createdat
      notificationtargets {
        changeby
        status
        type
      }
    }
  }
`;