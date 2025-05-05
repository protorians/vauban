import {LogErrorOptions, LogOptions, LogType} from "vite";
import {ArcaneEnv, ArcaneString} from "@protorians/arcane-core";
import logDateTime = ArcaneString.logDateTime;
import logTime = ArcaneString.logTime;
import isVerbose = ArcaneEnv.isVerbose;

export class Logger {

    static RESET: Readonly<string> = '\x1b[0m';

    static BRIGHT: Readonly<string> = "\x1b[1m"

    static DIM: Readonly<string> = "\x1b[2m"

    static UNDERSCORE: Readonly<string> = "\x1b[4m"

    static BLINK: Readonly<string> = "\x1b[5m"

    static REVERS: Readonly<string>

    static HIDDEN: Readonly<string> = "\x1b[8m"

    static FORE_BLACK: Readonly<string> = "\x1b[30m"

    static FORE_RED: Readonly<string> = "\x1b[31m"

    static FORE_GREEN: Readonly<string> = "\x1b[32m"

    static FORE_YELLOW: Readonly<string> = "\x1b[33m"

    static FORE_BLUE: Readonly<string> = "\x1b[34m"

    static FORE_MAGENTA: Readonly<string> = "\x1b[35m"

    static FORE_CYAN: Readonly<string> = "\x1b[36m"

    static FORE_WHITE: Readonly<string> = "\x1b[37m"

    static FORE_GRAY: Readonly<string> = "\x1b[90m"

    static FORE_CRIMSON: Readonly<string> = "\x1b[38m"

    static BACK_BLACK: Readonly<string> = "\x1b[40m"

    static BACK_RED: Readonly<string> = "\x1b[41m"

    static BACK_GREEN: Readonly<string> = "\x1b[42m"

    static BACK_YELLOW: Readonly<string> = "\x1b[43m"

    static BACK_BLUE: Readonly<string> = "\x1b[44m"

    static BACK_MAGENTA: Readonly<string> = "\x1b[45m"

    static BACK_CYAN: Readonly<string> = "\x1b[46m"

    static BACK_WHITE: Readonly<string> = "\x1b[47m"

    static BACK_GRAY: Readonly<string> = "\x1b[100m"

    static DATETIME_FORMAT: "time" | "date" = 'time';

    static get currentTimeFormat(): string {
        return `${this.FORE_GRAY}${this.DATETIME_FORMAT === 'time' ? logTime() : logDateTime()}${this.RESET}`
    }

    static text(text: string, color: string | null = null): string {
        return `${color || ''}}${text}${this.RESET}`
    }

    static log(...data: any[]): typeof this {
        if (isVerbose())
            console.log(this.currentTimeFormat, ...data)
        return this;
    }

    static black(...data: any[]): typeof this {
        this.log(this.FORE_BLACK, ...data, this.RESET)
        return this;
    }

    static red(...data: any[]): typeof this {
        this.log(this.FORE_RED, ...data, this.RESET)
        return this;
    }

    static green(...data: any[]): typeof this {
        this.log(this.FORE_GREEN, ...data, this.RESET)
        return this;
    }

    static yellow(...data: any[]): typeof this {
        this.log(this.FORE_YELLOW, ...data, this.RESET)
        return this;
    }

    static blue(...data: any[]): typeof this {
        this.log(this.FORE_BLUE, ...data, this.RESET)
        return this;
    }

    static magenta(...data: any[]): typeof this {
        this.log(this.FORE_MAGENTA, ...data, this.RESET)
        return this;
    }

    static cyan(...data: any[]): typeof this {
        this.log(this.FORE_CYAN, ...data, this.RESET)
        return this;
    }

    static white(...data) {
        this.log(this.FORE_WHITE, ...data, this.RESET)
        return this;
    }

    static gray(...data: any[]): typeof this {
        this.log(this.FORE_GRAY, ...data, this.RESET)
        return this;
    }

    static crimson(...data: any[]): typeof this {
        this.log(this.FORE_CRIMSON, ...data, this.RESET)
        return this;
    }

    static info(label: string, ...data: any[]): typeof this {
        console.log(
            this.currentTimeFormat,
            `${
                // this.DIM +
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_BLACK +
                this.FORE_WHITE
            } ${label.toUpperCase()} ${this.RESET}`,
            '',
            ...data
        )
        return this;
    }

    static highlight(label: string, ...data: any[]): typeof this {
        this.log(
            `${
                // this.DIM +
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_WHITE +
                this.FORE_BLACK
            } ${label.toUpperCase()} ${this.RESET}`,
            '',
            ...data
        )
        return this;
    }

    static notice(label: string, ...data: any[]): typeof this {
        this.log(
            `${
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_BLUE +
                this.FORE_WHITE
            } ${label.toUpperCase()} ${this.RESET}`,

            this.FORE_BLUE,
            ...data,
            this.RESET
        )
        return this;
    }

    static error(label: string, ...data: any[]): typeof this {
        this.log(
            `${
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_RED +
                this.FORE_BLACK
            } ${label.toUpperCase()} ${this.RESET}`,

            this.FORE_RED,
            ...data,
            this.RESET
        )
        return this;
    }

    static warning(label: string, ...data: any[]): typeof this {
        this.log(
            `${
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_YELLOW +
                this.FORE_BLACK
            } ${label.toUpperCase()} ${this.RESET}`,

            this.FORE_YELLOW,
            ...data,
            this.RESET
        )
        return this;
    }

    static success(label: string, ...data: any[]): typeof this {
        this.log(
            `${
                // this.BLINK +
                // this.BRIGHT +
                this.BACK_GREEN +
                this.FORE_BLACK
            } ${label.toUpperCase()} ${this.RESET}`,

            this.FORE_GREEN,
            ...data,
            this.RESET
        )
        return this;
    }


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


export class ViteLogger {
    static key: string = 'task';

    static info(msg: string, options?: LogOptions): void {
        if (options?.clear) console.clear()
        Logger.highlight(this.key, msg)
    }

    static warn(msg: string, options?: LogOptions): void {
        if (options?.clear) console.clear()
        Logger.warn(this.key, msg)
    }

    static warnOnce(msg: string, options?: LogOptions): void {
        if (options?.clear) console.clear()
        Logger.warn(this.key, msg)
    }

    static error(msg: string, options?: LogErrorOptions): void {
        if (options?.clear) console.clear()
        Logger.error(this.key, msg, options?.error || '')
    }

    static clearScreen(type: LogType): void {
        console.clear()
        if (type == 'info') this.info("clear")
        if (type == 'warn') this.warn("clear")
        if (type == 'error') this.error("clear")
    }

    static hasErrorLogged(error: any): boolean {
        return error instanceof Error
    }

    static hasWarned: boolean = true;
}