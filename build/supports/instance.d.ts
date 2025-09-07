export declare class RecordStack {
    static register<K, T>(key: K, instance: T, stack: Map<K, T>): T;
    static unregister<K, T>(key: K, stack: Map<K, T>): Map<K, T>;
}
