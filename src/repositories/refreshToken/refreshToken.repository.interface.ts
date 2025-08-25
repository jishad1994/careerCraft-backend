import { Role } from "../../models/user/user.interface";
export interface IRefreshTokenRepository {
    save(tokenId: string, userId: string, role: Role, email: string, expiresAt: Date): Promise<void>;
    find(tokenId: string): Promise<{ userId: string; role: Role; email: string; expiresAt: Date } | null>;
    delete(tokenId: string): Promise<void>;
    deleteAllForUser(userId: string): Promise<void>;
}
