export class RecordStack {
    static register(key, instance, stack) {
        if (stack.has(key))
            stack.delete(key);
        stack.set(key, instance);
        return instance;
    }
    static unregister(key, stack) {
        stack.delete(key);
        return stack;
    }
}
