import { store } from '../store/store';
import { setNotificationsCount } from '../store/slices/notificationsSlice';
import NotificationsService from '../services/api/graphQL/notifications/service';
import toast from 'react-hot-toast';
import { NotificationStatus } from '../types/NotificationStatus';
import { FaBell } from 'react-icons/fa6';

class BackgroundNotificationProcessor {
    private intervalId: NodeJS.Timeout | null = null;
    private intervalMs: number;
    private previousCount: number = 0;
    private username = '';
    private groups: string[] = [];

    constructor(intervalMs: number = (1000 * 60 * 5)) { // Default to 5 minutes
        this.intervalMs = intervalMs;
    }

    start(username:string, groups:string[]) {
        if (this.intervalId) return;
        this.previousCount = store.getState().notifications.count;

        this.username = username;
        this.groups = groups;
        
        this.intervalId = setInterval(this.process.bind(this), this.intervalMs);
    }

    stop() {
        if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        }
    }

    async process() {
        // Use localStorage for lastFetchedDate and notification ids for toast logic
        const lastFetchedDate = Number(localStorage.getItem('toastNotificationsLastFetchedDate')) || 0;
        const now = Date.now();
        if (!lastFetchedDate || now - lastFetchedDate >= this.intervalMs) {
        const service = NotificationsService.getInstance();
        
        
        // You may want to inject username/groups from context
        const count = await service.getNotificationsCount([this.username, ...this.groups, 'everyone']);
        localStorage.setItem('toastNotificationsLastFetchedDate', String(now));

        if (count > this.previousCount) {
            //set new count in redux store.
            store.dispatch(setNotificationsCount(count));

            // Refetch notifications list and toast only new notifications
            const status = [NotificationStatus.SENT, NotificationStatus.UNREAD];
            //TODO: jenish load only which for this week/day only.
            const newList = await service.getNotifications([this.username, ...this.groups, 'everyone'], status);
        
            // Get previous notification ids from localStorage
            const prevIds = JSON.parse(localStorage.getItem('toastNotificationsIds') || '[]');
            const newIds = newList.map(n => n.id);
        
            newList.forEach(n => {
                if (!prevIds.includes(n.id)) {
                    toast.success(
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                                <strong>{n.title || 'New notification received!'}</strong>
                                <div style={{ fontSize: '0.95em', marginTop: 2 }}>
                                    {n.message ? (n.message.length > 30 ? `${n.message.slice(0, 30)}...` : n.message) : ''}
                                </div>
                            </div>
                        </div>,
                        {
                            duration: 4000,
                            id: n.id,
                            icon: <FaBell className='text-warning' />,
                            position: 'top-right',
                        }
                    );
                }
            });
        
            // Update localStorage with new ids and lastFetchedDate
            localStorage.setItem('toastNotificationsIds', JSON.stringify(newIds));
        }
        this.previousCount = count;
        }
    }
}

export default BackgroundNotificationProcessor;
