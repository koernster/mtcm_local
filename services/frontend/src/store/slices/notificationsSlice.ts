import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../services/api/graphQL/notifications/types/notifications';

interface NotificationsState {
  count: number;
  list: Notification[];
}

const initialState: NotificationsState = {
  count: 0,
  list: []
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsCount(state, action: PayloadAction<number>) {
      state.count = action.payload;
    },
    setNotificationsList(state, action: PayloadAction<Notification[]>) {
      state.list = action.payload;
    }
  }
});

export const { setNotificationsCount, setNotificationsList } = notificationsSlice.actions;
export default notificationsSlice.reducer;
