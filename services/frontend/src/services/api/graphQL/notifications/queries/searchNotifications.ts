import { gql } from '@apollo/client';

export const SEARCH_NOTIFICATIONS = gql`
  query SearchNotifications($_search: String, $_status: [Int!], $_target: [String!]) {
    notifications(
      where: {
        _and: [
          { notificationtargets: { target: { _in: $_target }, status: { _in: $_status } } }
          {
            _or: [
              { title: { _ilike: $_search } }
              { message: { _ilike: $_search } }
            ]
          }
        ]
      }
      order_by: { createdat: desc }
    ) {
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
