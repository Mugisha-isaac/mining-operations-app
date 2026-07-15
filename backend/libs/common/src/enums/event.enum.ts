/** RabbitMQ routing/event names. Keep every publisher/consumer pinned to this. */
export enum EventName {
  INCIDENT_CREATED = 'incident.created',
}

/** Socket.io event names emitted to connected dashboard clients. */
export enum SocketEvent {
  INCIDENT_CREATED = 'incident:created',
  DASHBOARD_STATS_UPDATED = 'dashboard:stats-updated',
}

/** Bull queue + job names used by notification-service. */
export enum QueueName {
  NOTIFICATIONS = 'notifications',
}

export enum JobName {
  SEND_INCIDENT_NOTIFICATION = 'send-incident-notification',
}
