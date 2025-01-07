## Event Driven Architecture
Event happens, you get to know about it and then you react on it.


## Webhooks via Clerk
- Webhook is an event-driven method of communication between applications.

- Unlike typical APIs where you would need to poll for data very frequently to get it "real-time", webhooks only send data when there is an event to trigger the webhook. This makes webhooks seem "real-time", but it's important to note that they are asynchronous.


- Example: As soon as user register's successfully, clerk will shoot a lot of events knowns as Webhooks. These webhooks are nothing but the events that are being triggered by the system. These events are being listened by an Api endpoint. This Api endpoint is nothing but a server that is listening to the events. As soon as the event is being triggered, the server will get to know about it and then it will react on it as per the logic written in the server.