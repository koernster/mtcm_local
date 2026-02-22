export interface NotificationsCountData {
  notificationtargets_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface NotificationsCountVariables {
  _status?: number[];
  _target?: string[];
}
