import {Terminal} from "@protorians/arcane-core";

export class Logger extends Terminal.Display {
    static stack() {
        return (new Error())
            .stack?.split('\n')
            .map(line => line.trim())
            .reverse() || []
    }

    static say(label: string, ...data: any[]) {
        return this.log(` ${label.toUpperCase()} `, ...data);
    }

    static warn(label: string, ...data: any[]) {
        return this.warning(label, ...data)
    }
}