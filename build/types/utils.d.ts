export type NonPartial<T> = {
    [K in keyof T]: NonNullable<T[K]>;
};
