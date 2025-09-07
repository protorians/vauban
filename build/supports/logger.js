import { ArcaneEnv, ArcaneString } from "@protorians/arcane-core";
var logDateTime = ArcaneString.logDateTime;
var logTime = ArcaneString.logTime;
var isVerbose = ArcaneEnv.isVerbose;
export class Logger {
    static RESET = '\x1b[0m';
    static BRIGHT = "\x1b[1m";
    static DIM = "\x1b[2m";
    static UNDERSCORE = "\x1b[4m";
    static BLINK = "\x1b[5m";
    static REVERS;
    static HIDDEN = "\x1b[8m";
    static FORE_BLACK = "\x1b[30m";
    static FORE_RED = "\x1b[31m";
    static FORE_GREEN = "\x1b[32m";
    static FORE_YELLOW = "\x1b[33m";
    static FORE_BLUE = "\x1b[34m";
    static FORE_MAGENTA = "\x1b[35m";
    static FORE_CYAN = "\x1b[36m";
    static FORE_WHITE = "\x1b[37m";
    static FORE_GRAY = "\x1b[90m";
    static FORE_CRIMSON = "\x1b[38m";
    static BACK_BLACK = "\x1b[40m";
    static BACK_RED = "\x1b[41m";
    static BACK_GREEN = "\x1b[42m";
    static BACK_YELLOW = "\x1b[43m";
    static BACK_BLUE = "\x1b[44m";
    static BACK_MAGENTA = "\x1b[45m";
    static BACK_CYAN = "\x1b[46m";
    static BACK_WHITE = "\x1b[47m";
    static BACK_GRAY = "\x1b[100m";
    static DATETIME_FORMAT = 'time';
    static get currentTimeFormat() {
        return `${this.FORE_GRAY}${this.DATETIME_FORMAT === 'time' ? logTime() : logDateTime()}${this.RESET}`;
    }
    static text(text, color = null) {
        return `${color || ''}}${text}${this.RESET}`;
    }
    static log(...data) {
        if (isVerbose())
            console.log(this.currentTimeFormat, ...data);
        return this;
    }
    static black(...data) {
        this.log(this.FORE_BLACK, ...data, this.RESET);
        return this;
    }
    static red(...data) {
        this.log(this.FORE_RED, ...data, this.RESET);
        return this;
    }
    static green(...data) {
        this.log(this.FORE_GREEN, ...data, this.RESET);
        return this;
    }
    static yellow(...data) {
        this.log(this.FORE_YELLOW, ...data, this.RESET);
        return this;
    }
    static blue(...data) {
        this.log(this.FORE_BLUE, ...data, this.RESET);
        return this;
    }
    static magenta(...data) {
        this.log(this.FORE_MAGENTA, ...data, this.RESET);
        return this;
    }
    static cyan(...data) {
        this.log(this.FORE_CYAN, ...data, this.RESET);
        return this;
    }
    static white(...data) {
        this.log(this.FORE_WHITE, ...data, this.RESET);
        return this;
    }
    static gray(...data) {
        this.log(this.FORE_GRAY, ...data, this.RESET);
        return this;
    }
    static crimson(...data) {
        this.log(this.FORE_CRIMSON, ...data, this.RESET);
        return this;
    }
    static info(label, ...data) {
        console.log(this.currentTimeFormat, `${this.BACK_BLACK +
            this.FORE_WHITE} ${label.toUpperCase()} ${this.RESET}`, '', ...data);
        return this;
    }
    static highlight(label, ...data) {
        this.log(`${this.BACK_WHITE +
            this.FORE_BLACK} ${label.toUpperCase()} ${this.RESET}`, '', ...data);
        return this;
    }
    static notice(label, ...data) {
        this.log(`${this.BACK_BLUE +
            this.FORE_WHITE} ${label.toUpperCase()} ${this.RESET}`, this.FORE_BLUE, ...data, this.RESET);
        return this;
    }
    static error(label, ...data) {
        this.log(`${this.BACK_RED +
            this.FORE_BLACK} ${label.toUpperCase()} ${this.RESET}`, this.FORE_RED, ...data, this.RESET);
        return this;
    }
    static warning(label, ...data) {
        this.log(`${this.BACK_YELLOW +
            this.FORE_BLACK} ${label.toUpperCase()} ${this.RESET}`, this.FORE_YELLOW, ...data, this.RESET);
        return this;
    }
    static success(label, ...data) {
        this.log(`${this.BACK_GREEN +
            this.FORE_BLACK} ${label.toUpperCase()} ${this.RESET}`, this.FORE_GREEN, ...data, this.RESET);
        return this;
    }
    static stack() {
        return (new Error())
            .stack?.split('\n')
            .map(line => line.trim())
            .reverse() || [];
    }
    static say(label, ...data) {
        return this.log(` ${label.toUpperCase()} `, ...data);
    }
    static warn(label, ...data) {
        return this.warning(label, ...data);
    }
}
export class ViteLogger {
    static key = 'task';
    static info(msg, options) {
        if (options?.clear)
            console.clear();
        Logger.highlight(this.key, msg);
    }
    static warn(msg, options) {
        if (options?.clear)
            console.clear();
        Logger.warn(this.key, msg);
    }
    static warnOnce(msg, options) {
        if (options?.clear)
            console.clear();
        Logger.warn(this.key, msg);
    }
    static error(msg, options) {
        if (options?.clear)
            console.clear();
        Logger.error(this.key, msg, options?.error || '');
    }
    static clearScreen(type) {
        console.clear();
        if (type == 'info')
            this.info("clear");
        if (type == 'warn')
            this.warn("clear");
        if (type == 'error')
            this.error("clear");
    }
    static hasErrorLogged(error) {
        return error instanceof Error;
    }
    static hasWarned = true;
}
