# Notification service

What is a Notification?
- A notification is a message which inform or alert user regarding specific event or action. 
- Notification send when require user or customer attention. 

## Types of Notification
### Notifications can be categorized based on their purpose, behavior, and delivery method.

### Based on Delivery Method

- Push Notification
    - Sent from a server to a user's device (web or mobile)
    - Example: new message alerts on WhatsApp
- Email Notification
    - Sent via email to inform users about an update.
    - Example: Your order has been shipped email from an e-commerce platform.
- SMS Notification
    - Delivered as text messages to users mobile phones
    - Example: OTP (One-Time Password) messages for authentication.
- In Application Notification
    - Appear inside an application while the user is actively using it.
    - Example: Profile update successfully message inside a web app.
    - Example: When receive new message on FB
- Desktop Notification
    - Appear on the user's computer screen outside the browser or app.
    - Example: Slack message pop-up on Windows/MacOS.
- System Notification
    - Built into operating systems to alert users about system events.
    - Example: Battery low alert on a laptop.

### Based on User Interaction
    - Passive Notifications
        - Don't require user interaction
        - Example: A badge count on an app icon
    - Actionable Notifications
        - Allow users to respond (e.g. Accept/Reject, Mark as Read)
        - Example: A notification with Reply an Dismiss options in a messaging app
    - Persistent Notification
        - Stay visible until manually dismissed by the user.
        - Example: Software update available notification
    - Transient Notification
        - Disappear after a short duration
        - Example: A toast message saying Message sent successfully

## Conclusion
- Notifications are crucial for keeping users informed and engaged. 
- The type of notification used depends on the context—real-time updates may require push notifications, while less urgent messages can be sent via email.


## Building Scalable Notification Service (Independent, losely coupled)
- Architecture Overview
    - API Gateway: Expose REST or GraphQL endpoint for sending notification
    - Notification Service: Process notifications and routes them to the appropriate providers (Email, SMS, Push, etc)
    - Queue System: (e.g. Redis, RabbitMQ, Kafka, SQS) Ensures async processing and prevents request overload.
    - Database: (MongoDB, PostgreSQL, DynamoDB) store notification logs and user preference
    - Providers: (AWS SNS, Twilio, Firebase, SendGrid, etc.) external services for SMS, Email, and Push notification.

## Flow
- Client/API Request → (REST/GraphQL API)
- Notification Service → Validates & Stores in DB
- Queue System → Asynchronous Processing
- Providers → Sends notifications to users
- Logs & Monitoring → Tracks status 

