export interface NotificationTarget {
  changeby: string;
  status: number;
  type: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdby: string;
  createdat: string;
  notificationtargets: NotificationTarget[];
}

export interface GetNotificationsData {
  notifications: Notification[];
}

export interface GetNotificationsVariables {
  _status: number[];
  _target: string[];
}

export interface SearchNotificationsVariables extends GetNotificationsVariables {
  _search: string;
}
