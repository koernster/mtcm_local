import { NotificationStatus } from '../../../../types/NotificationStatus';
import client from '../client';
import { GET_NOTIFICATIONS_COUNT } from './queries/getNotificationsCount';
import { GET_NOTIFICATIONS } from './queries/getNotifications';
import { SEARCH_NOTIFICATIONS } from './queries/searchNotifications';
import { NotificationsCountData, NotificationsCountVariables } from './types/notificationsCount';
import { GetNotificationsData, GetNotificationsVariables, Notification, SearchNotificationsVariables } from './types/notifications';
import { UPDATE_NOTIFICATIONTARGET_STATUS } from './queries/updateNotificationTargetStatus';

class NotificationsService {
  private static instance: NotificationsService;

  private constructor() {}

  public static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  public async getNotificationsCount(
    target: string[]
  ): Promise<number> {
    const status: number[] = [NotificationStatus.SENT, NotificationStatus.UNREAD];
    const { data } = await client.query<NotificationsCountData, NotificationsCountVariables>({
      query: GET_NOTIFICATIONS_COUNT,
      variables: {
        _status: status,
        _target: target
      },
      fetchPolicy: 'network-only'
    });
    return data.notificationtargets_aggregate.aggregate.count;
  }

  public async getNotifications(
    target: string[],
    status: number[] = [NotificationStatus.ARCHIVED]
  ): Promise<Notification[]> {
    const { data } = await client.query<GetNotificationsData, GetNotificationsVariables>({
      query: GET_NOTIFICATIONS,
      variables: {
        _status: status,
        _target: target
      },
      fetchPolicy: 'network-only'
    });
    return data.notifications;
  }

  public async searchNotifications(
    search: string,
    target: string[],
    status: number[] = [NotificationStatus.ARCHIVED]
  ): Promise<Notification[]> {
    const { data } = await client.query<GetNotificationsData, SearchNotificationsVariables>({
      query: SEARCH_NOTIFICATIONS,
      variables: {
        _search: `%${search}%`,
        _status: status,
        _target: target
      },
      fetchPolicy: 'network-only'
    });
    return data.notifications;
  }

  public async updateStatus(notificationid: string, status: number): Promise<{ notificationid: string; status: number }> {
    const { data } = await client.mutate({
      mutation: UPDATE_NOTIFICATIONTARGET_STATUS,
      variables: {
        notificationid,
        status
      }
    });
    return data.update_notificationtargets.returning[0];
  }
}

export default NotificationsService;
