import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import NotificationsService from '../services/api/graphQL/notifications/service';
import { setNotificationsCount, setNotificationsList } from '../store/slices/notificationsSlice';
import { RootState } from '../store/store';
import { useAuth } from '../context/AuthContext';
import { NotificationStatus } from '../types/NotificationStatus';

const useNotifications = () => {
  const dispatch = useDispatch();
  const notificationsCount = useSelector((state: RootState) => state.notifications.count);
  const notificationsList = useSelector((state: RootState) => state.notifications.list);
  const { keycloak } = useAuth();
  const usernameWithoutSpace = keycloak?.tokenParsed?.name?.replace(/\s+/g, '') || '';
  const groups = keycloak?.tokenParsed?.groups || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState(false);

  const fetchNotificationsCount = useCallback(async () => {
    const service = NotificationsService.getInstance();
    const count = await service.getNotificationsCount([usernameWithoutSpace, ...groups, 'everyone']);
    dispatch(setNotificationsCount(count));
    return count;
  }, [dispatch, usernameWithoutSpace, groups]);

  const fetchNotificationsList = useCallback(async (status: number[], search?: string) => {
    setLoadingList(true);
    try {
      const service = NotificationsService.getInstance();
      const targets = [usernameWithoutSpace, ...groups, 'everyone'];
      let list;
      if (search) {
        list = await service.searchNotifications(search, targets, status);
      } else {
        list = await service.getNotifications(targets, status);
      }
      dispatch(setNotificationsList(list));
      return list;
    } finally {
      setLoadingList(false);
    }
  }, [dispatch, usernameWithoutSpace, groups]);

  useEffect(() => {
    fetchNotificationsCount();
    //fetchNotificationsList([NotificationStatus.SENT, NotificationStatus.UNREAD, NotificationStatus.ARCHIVED]);
    // eslint-disable-next-line
  }, []);

  const updateStatus = useCallback(async (notificationid: string, status: number) => {
    setLoadingStatus(true);
    try {
      const service = NotificationsService.getInstance();
      const updated = await service.updateStatus(notificationid, status);
      if (updated.notificationid === notificationid && updated.status === status) {
        // update notification in redux store
        const newList = notificationsList.map(n =>
          n.id === notificationid ? { ...n, notificationtargets: n.notificationtargets.map(t => ({ ...t, status })) } : n
        );
        dispatch(setNotificationsList(newList));

        // update count in redux store
        // count = notifications with SENT or UNREAD status
        const newCount = newList.reduce((acc, n) => {
          const hasTarget = n.notificationtargets.some(t =>
            t.status === NotificationStatus.SENT || t.status === NotificationStatus.UNREAD
          );
          return acc + (hasTarget ? 1 : 0);
        }, 0);
        dispatch(setNotificationsCount(newCount));
      }
      return updated;
    } finally {
      setLoadingStatus(false);
    }
  }, [dispatch, notificationsList]);

  return {
    notificationsCount,
    notificationsList,
    refetchNotificationsCount: fetchNotificationsCount,
    refetchNotificationsList: fetchNotificationsList,
    updateStatus,
    loadingList,
    loadingStatus,
    searchQuery,
    setSearchQuery,
    debouncedSearch
  };
};

export default useNotifications;
