from datetime import datetime
from app.models.cron_event import CronEventExecution
from app.services.graphQL.dynamic_query_service import DynamicQueryService
from app.services.graphQL.notification_service import Notification, NotificationService
from app.utils.deep_template_replacer import replace_template_vars


def run(execution: CronEventExecution):
    print(f"[NOTIFICATION_TRACE] Starting notification job for event: {execution.event}")
    print(f"[NOTIFICATION_TRACE] Case ID: {execution.caseid}, Target: {execution.target}, Target Type: {execution.targettype}")
    print(f"[NOTIFICATION_TRACE] Title: {execution.title}")
    
    try:
        message = "test message"
        
        if execution.graphql is None or execution.graphql.strip() == "":
            print("[NOTIFICATION_TRACE] No GraphQL query provided, using template directly")
            message = execution.template or "Default message"
            message_preview = message[:100] + ('...' if len(message) > 100 else '')
            print(f"[NOTIFICATION_TRACE] Direct template message: {message_preview}")
        else:
            print("[NOTIFICATION_TRACE] GraphQL query provided, executing dynamic query")
            query_preview = execution.graphql[:200] + ('...' if len(execution.graphql) > 200 else '')
            print(f"[NOTIFICATION_TRACE] GraphQL query: {query_preview}")
            
            print("[NOTIFICATION_TRACE] Initializing DynamicQueryService...")
            query_service = DynamicQueryService()
            print("[NOTIFICATION_TRACE] DynamicQueryService initialized successfully")
            
            print(f"[NOTIFICATION_TRACE] Executing GraphQL query with case ID: {execution.caseid}")
            data = query_service.execute_query(
                execution.graphql,
                {
                    "id": execution.caseid,
                }
            )
            print(f"[NOTIFICATION_TRACE] GraphQL query executed successfully, data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            print("[NOTIFICATION_TRACE] Replacing template variables with query data...")
            message = replace_template_vars(execution.template or "Default template", data)
            message_preview = message[:100] + ('...' if len(message) > 100 else '')
            print(f"[NOTIFICATION_TRACE] Template processed, final message: {message_preview}")
    
        print(f"[NOTIFICATION_TRACE] Preparing notification for saving...")
        
        # Here you can integrate with an actual notification service 
        print("[NOTIFICATION_TRACE] Initializing NotificationService...")
        notification_service = NotificationService()
        print("[NOTIFICATION_TRACE] NotificationService initialized successfully")
        
        notification = Notification(
            title=execution.title or "System Notification",
            message=message,
            createdat=datetime.now().strftime("%m-%d-%Y"),
            createdby="system",  # or fetch from context
            type=execution.targettype or "G",
            target=execution.target or "everyone",
            status=1,
            notificationid=""
        ) # type: ignore
        
        print(f"[NOTIFICATION_TRACE] Notification object created - Title: {execution.title}, Type: {execution.targettype}")
        print(f"[NOTIFICATION_TRACE] Attempting to save notification...")
        
        notification_id = notification_service.save_notification(notification)
        if notification_id:
            print(f"[NOTIFICATION_TRACE] Notification saved successfully with ID: {notification_id}")
        else:
            print(f"[NOTIFICATION_ERROR] Failed to save notification for event: {execution.event}")
            
        print(f"[NOTIFICATION_TRACE] Successfully completed notification job for event: {execution.event}")
        
    except Exception as e:
        print(f"[NOTIFICATION_ERROR] Exception occurred during notification processing: {str(e)}")
        print(f"[NOTIFICATION_ERROR] Event: {execution.event}, Case ID: {execution.caseid}")
        raise



