import { gql } from '@apollo/client';

export const UPDATE_NOTIFICATIONTARGET_STATUS = gql`
  mutation UpdateNotificationTargetStatus($notificationid: uuid!, $status: Int!) {
    update_notificationtargets(
      where: {notificationid: {_eq: $notificationid}},
      _set: {status: $status}
    ) {
      returning {
        notificationid
        status
      }
    }
  }
`;
