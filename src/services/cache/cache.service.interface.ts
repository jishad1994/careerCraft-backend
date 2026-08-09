export interface ICacheService {
    connect(): Promise<void>;

    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void | boolean>;
    delete(key: string): Promise<void | boolean>;
}
