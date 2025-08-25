import { ICache } from "./cache.service.interface";

export class CacheService implements ICache {
    //constructor
    constructor(private cacheRepo: ICache) {}

    //connect the redis cache service
    async connect(): Promise<void> {
        try {
            await this.cacheRepo.connect();
        } catch (err) {
            console.log("failed to connect to cache service", err);
            throw new Error("cache connection failed");
        }
    }

    //set
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean | void> {
        await this.cacheRepo.set(key, value, ttlSeconds);
    }

    //get
    async get<T>(key: string): Promise<T | null> {
        return await this.cacheRepo.get(key);
    }

    //delete
    async delete(key: string): Promise<void | boolean> {
        await this.cacheRepo.delete(key);
    }
}
