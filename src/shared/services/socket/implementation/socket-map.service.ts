import { IUserSocketMapService } from "../interface/socket-map.service.interface";

export class UserSocketMapservice implements IUserSocketMapService {
    private readonly userSockets: Map<string, Set<string>>;
    constructor() {
        this.userSockets = new Map<string, Set<string>>();
    }

    /**
     * Add socket to user's socket set
     */
    addSocket(userId: string, socketId: string): void {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set<string>());
        }
        this.userSockets.get(userId)?.add(socketId);
    }

    /**
     * Remove socket from user's socket set
     */
    removeSocket(userId: string, socketId: string): void {
        const sockets = this.userSockets.get(userId);

        if (sockets) {
            sockets.delete(socketId);

            // Remove user entry if no sockets left
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }

    /**
     * Get all socket IDs for a user
     */
    getUserSockets(userId: string): Set<string> | undefined {
        return this.userSockets.get(userId);
    }

    /**
     * Check if user has any active sockets
     */
    hasUser(userId: string): boolean {
        const sockets = this.userSockets.get(userId);
        return sockets ? sockets.size > 0 : false;
    }

    /**
     * Get total number of connected users
     */
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    /**
     * Clear all socket mappings
     */
    clear(): void {
        this.userSockets.clear();
    }
}
