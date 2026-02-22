import React, { useEffect } from 'react';
import { Button, Container, Row } from 'react-bootstrap';
import NoticationsList from '../components/notications/NoticationsList';
import NoticationsDetail from '../components/notications/NoticationsDetailedView';
import ContentArea from '../components/common/ContentArea';
import { FaEnvelopeOpenText, FaBoxArchive, FaEnvelope } from 'react-icons/fa6';
import VerticleCollapsContainer from '../components/common/VerticleCollapsContainer';
import { useParams } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import { Notification } from '../services/api/graphQL/notifications/types/notifications';
import { dateUtils } from '../utils/formatters';
import { NotificationStatus } from '../types/NotificationStatus';
import SkeletonLoading from '../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
    const { notificationId } = useParams<{ notificationId: string }>();
    const [currentNotification, setCurrentNotification] = React.useState<Notification | null>(null);
    const { notificationsList, loadingStatus, updateStatus }= useNotifications();
  

    const updateReadStatus = async ()=>{
        if (currentNotification) {
            const newStatus = currentNotification.notificationtargets[0]?.status === NotificationStatus.SENT || currentNotification.notificationtargets[0]?.status === NotificationStatus.UNREAD
                ? NotificationStatus.READ
                : NotificationStatus.UNREAD;
            _updateStatusInternal(newStatus);
        }
    }

    const updateArchiveStatus = async ()=>{
        if (currentNotification) {
            const newStatus = currentNotification.notificationtargets[0]?.status === NotificationStatus.ARCHIVED
                ? NotificationStatus.UNREAD
                : NotificationStatus.ARCHIVED;
            _updateStatusInternal(newStatus);
        }
    }

    const _updateStatusInternal = async (status: number) => {
        if (currentNotification) {
            const updated = await updateStatus(currentNotification.id, status);
            if (updated.notificationid === currentNotification.id && updated.status === status) {
                setCurrentNotification({
                    ...currentNotification,
                    notificationtargets: currentNotification.notificationtargets.map(t => ({ ...t, status }))
                });
                
                const getStatusMessage = () => {
                    switch(status) {
                        case NotificationStatus.UNREAD:
                            return 'Marked Unread';
                        case NotificationStatus.READ:
                            return 'Read';
                        case NotificationStatus.ARCHIVED:
                            return 'Archived';
                    }
                }
                // toast user on success
                toast.success(`Notification ${getStatusMessage()}!`);
            }
        }
    }    

    // on notificationID change, fetch the notification from the redux store or API
    useEffect(() => {
        if (notificationId) {
            const notification = notificationsList.find((n) => n.id === notificationId);
            setCurrentNotification(notification || null);
        }
    }, [notificationId, notificationsList]);

    return (<Container fluid>
                <Row className="d-flex">
                    <VerticleCollapsContainer 
                        sm={3} 
                        md={3} 
                        xs={3} 
                        titleText="Notifications"
                    >
                        <NoticationsList />
                    </VerticleCollapsContainer>
                    {currentNotification &&
                        <ContentArea 
                            sm={9}
                            md={9}
                            toolButtons={
                                        loadingStatus ? <SkeletonLoading count={1} height={[20]} width={['150px']} /> :
                                        (
                                            currentNotification.notificationtargets[0]?.status !== NotificationStatus.ARCHIVED ?
                                            (<>
                                                <Button variant="outline-success" size="sm" onClick={updateReadStatus}>
                                                    {(() => {
                                                        switch(currentNotification.notificationtargets[0]?.status) {
                                                            case NotificationStatus.SENT:
                                                            case NotificationStatus.UNREAD:
                                                                return <><FaEnvelopeOpenText /> Mark as Read</>;
                                                            case NotificationStatus.READ:
                                                                return <><FaEnvelope /> Mark as Unread</>;
                                                        }
                                                    })()}
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={updateArchiveStatus}>
                                                    <FaBoxArchive /> Archive
                                                </Button>
                                            </>) : 
                                            <>
                                                <Button variant="outline-warning" size="sm" onClick={updateArchiveStatus}>
                                                    <FaBoxArchive /> Unarchive
                                                </Button>
                                            </>
                                        )
                                    }
                            header={currentNotification ? currentNotification.title : 'Notification Detail'}
                            subHeader={`${dateUtils.format(currentNotification?.createdat)} • Created By: ${currentNotification?.createdby} • Type: ${(currentNotification?.notificationtargets[0]?.type.toLocaleUpperCase() === 'G' ? 'Group' : 'User')}`}
                            body={<NoticationsDetail notification={currentNotification} />}
                        />
                    }
                </Row>
            </Container>);
}

export default NotificationsPage;