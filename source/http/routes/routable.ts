import {RoutableScheme} from "../routes-scheme.js";
import {IRoutableProps} from "../../types/index.js";


export function Routable(props: IRoutableProps) {
    return function (target: any, key: string) {
        const pathname = props.path;

        if (RoutableScheme.has(pathname))
            throw new Error(`Route "${pathname}" already exists`);

        RoutableScheme.set(pathname, {
            pathname,
            target: target.constructor,
            props,
            key,
        });
    }
}