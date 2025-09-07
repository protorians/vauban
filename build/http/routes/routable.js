import { RoutableScheme } from "../routes-scheme.js";
export function Routable(props) {
    return function (target, key) {
        const pathname = props.path;
        if (RoutableScheme.has(pathname))
            throw new Error(`Route "${pathname}" already exists`);
        RoutableScheme.set(pathname, {
            pathname,
            target: target.constructor,
            props,
            key,
        });
    };
}
