export class RecordStack {
    static register<K, T>(key: K, instance: T, stack: Map<K, T>): T {
        if (stack.has(key)) stack.delete(key);
        stack.set(key, instance);
        return instance;
    }

    static unregister<K, T>(key: K, stack: Map<K, T>): Map<K, T> {
        stack.delete(key);
        return stack;
    }
}
