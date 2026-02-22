import os
import uuid
import requests
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class Notification:
    title: str
    message: str
    createdat: str
    createdby: str
    #notification target
    notificationid: str
    type: str
    target: str
    status: int


class NotificationService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL","")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }

    def save_notification(self, notification: Notification):
        notificationId = str(uuid.uuid4())
        mutation = '''
        mutation InsertNotification(
            $id: uuid!
            $title: String
            $message: String
            $createdat: timestamp!
            $createdby: String
        ) {
            insert_notifications_one(object: {
                id: $id
                title: $title
                message: $message
                createdat: $createdat
                createdby: $createdby
            }) {
                id
            }
        }
        '''

        variables = {
            "id": notificationId,
            "title": notification.title,
            "message": notification.message,
            "createdat": notification.createdat,
            "createdby": notification.createdby,
        }
        #print(f"Saving notification with variables: {variables}")

        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        
        #print(f"Notification save response: {data}")
        
        if response.status_code == 200:
            inserted = data.get("data", {}).get("insert_notifications_one", {})
            if inserted and inserted.get("id") == notificationId:
                #save notification target
                notification.notificationid = notificationId
                return self.save_notification_target(notification)
        return None
    
    def save_notification_target(self, notification: Notification):
        mutation = '''
        mutation InsertNotificationTarget(
            $notificationid: uuid!
            $type: bpchar
            $target: String
            $status: Int
        ) {
            insert_notificationtargets_one(object: {
                notificationid: $notificationid
                type: $type
                target: $target
                status: $status
            }) {
                notificationid
            }
        }
        ''' 

        variables = {
            "notificationid": notification.notificationid,
            "type": notification.type,
            "target": notification.target,
            "status": notification.status,
        }

        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        
        #print(f"Notification-Target save response: {data}")

        if response.status_code == 200:
            inserted = data.get("data", {}).get("insert_notificationtargets_one", {})
            if inserted and inserted.get("notificationid"):
                return inserted.get("notificationid")
        return None