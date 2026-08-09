export interface IUserSocketMapService {
  addSocket(userId: string, socketId: string): void;
  removeSocket(userId: string, socketId: string): void;
  getUserSockets(userId: string): Set<string> | undefined;
  hasUser(userId: string): boolean;
  getConnectedUsersCount(): number;
  clear(): void;
}