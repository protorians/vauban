import { RecordStack } from "./instance.js";
export class Plugins {
    static stack = new Map();
}
export class Plugin {
    options;
    constructor(options) {
        this.options = options;
        RecordStack.register(this.options.name, this, Plugins.stack);
    }
    detach() {
        RecordStack.unregister(this.options.name, Plugins.stack);
    }
}
