export interface ISocketService {
  sendNotificationToUser(userId: string, notification: unknown): Promise<void>;
  sendNotificationToUsers(userIds: string[], notification: unknown): Promise<void>;
  sendUnreadCountToUser(userId: string, count: number): void;
  isUserOnline(userId: string): boolean;
  getConnectedUsersCount(): number;
}