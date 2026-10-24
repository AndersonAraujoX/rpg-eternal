import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Creates a React.lazy component from a dynamic module import that uses named exports.
 * 
 * @template TModule The module object type.
 * @template TKey The specific named export key.
 * @param factory A function returning the Promise of the dynamically imported module.
 * @param name The name of the exported component.
 * @returns A LazyExoticComponent resolving to the specified named export.
 */
export function lazyNamed<
    TModule extends Record<string, any>,
    TKey extends keyof TModule
>(
    factory: () => Promise<TModule>,
    name: TKey
): LazyExoticComponent<
    TModule[TKey] extends ComponentType<infer P> ? ComponentType<P> : ComponentType<any>
> {
    if (typeof factory !== 'function') {
        throw new TypeError('[lazyNamed] The factory parameter must be a function returning a Promise.');
    }

    if (!name || typeof name !== 'string') {
        throw new TypeError('[lazyNamed] The name parameter must be a non-empty string.');
    }

    return lazy(async () => {
        const module = await factory();

        if (!module || typeof module !== 'object') {
            throw new Error(`[lazyNamed] Module import failed to return an object for '${String(name)}'.`);
        }

        const component = module[name];

        if (!component) {
            throw new Error(`[lazyNamed] Named export '${String(name)}' was not found in the imported module.`);
        }

        return { default: component };
    });
}
