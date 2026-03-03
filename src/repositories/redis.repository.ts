import { ICacheService } from "../services/cache/cache.service.interface";
import { RedisClientType, createClient } from "redis";
import { AppError } from "../errors-classes/app.error.";

export class RedisCacheRepo implements ICacheService {
    private client: RedisClientType;

    constructor(private url: string) {
        this.client = createClient({ url: this.url });
        this.client.on("error", (error) => console.error("redis Error:", error));
    }
    //static connect method
    async connect(): Promise<void> {
        try {
            await this.client.connect();
            console.log("redis cache service connected");
        } catch (error) {
            console.log("redis connection failed", error);
            throw new AppError("redis connection failed", undefined, false);
        }
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
    async delete(key: string): Promise<void | boolean> {
        await this.client.del(key);
        return true;
    }
}
