export interface ICache {
     connect(): Promise<void>;

    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void | boolean>;
    delete<T>(key: string): Promise<void | boolean>;
}
