import { ControllableScheme, RoutableScheme } from "../routes-scheme.js";
export function Controllable(props) {
    return function (target) {
        const pathname = `${target.prefix || ''}${props.endpoint}`;
        if (ControllableScheme.has(props.endpoint))
            throw new Error(`Route Controller "${props.endpoint}" already exists`);
        ControllableScheme.set(pathname, {
            pathname,
            target: target,
            props,
            routes: [...RoutableScheme.values()],
        });
        RoutableScheme.clear();
    };
}
