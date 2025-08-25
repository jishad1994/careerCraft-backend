import { IRefreshTokenRepository } from "./refreshToken.repository.interface";
import { ICache } from "../../services/cache/cache.service.interface";
import { Role } from "../../models/user/user.interface";

export class RefreshTokenRepository implements IRefreshTokenRepository {
    constructor(private cache: ICache) {}

    //create key for saving in the cache
    private key(tokenId: string): string {
        return `rt:${tokenId}`;
    }

    async save(tokenId: string, userId: string, role: Role, email: string, expiresAt: Date): Promise<void> {
        const ttl: number = Math.max(1, Math.floor((+expiresAt - Date.now()) / 1000)); //conver date to numbers
        await this.cache.set<string>(
            this.key(tokenId),
            JSON.stringify({ userId, role, email, expiresAt }), //payload
            ttl
        );
    }

    async find(tokenId: string): Promise<{ userId: string; role: Role; email: string; expiresAt: Date } | null> {
        const val = await this.cache.get<string>(this.key(tokenId));
        return val ? (JSON.parse(val) as { userId: string; role: Role; email: string; expiresAt: Date }) : null;
    }

    async delete(tokenId: string): Promise<void> {
        await this.cache.delete(this.key(tokenId));
    }

    async deleteAllForUser(userId: string): Promise<void> {
        console.log(userId); //consider in the end
    }
}
