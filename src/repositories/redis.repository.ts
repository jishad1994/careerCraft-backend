import { ICache } from "../services/cache/ICacheService";
import { RedisClientType, createClient } from "redis";

export class RedisCacheRepo implements ICache {
    private client: RedisClientType;

    constructor(private url: string) {
        this.client = createClient({ url: this.url });
        this.client.on("error", (error) => console.error("redis Error:", error));
    }
    //static connect method
    async connect(): Promise<void> {
        await this.client.connect();
        console.log("redis cache service connected");
    }

    //get method
    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    //set method
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean | void> {
        const data = JSON.stringify(value);

        if (ttlSeconds) {
            await this.client.setEx(key, ttlSeconds, data);
            return true;
        } else {
            await this.client.set(key, data);
            return true;
        }
    }

    //delete method
    async delete<T>(key: string): Promise<void | boolean> {
        await this.client.del(key);
        return true;
    }
}
