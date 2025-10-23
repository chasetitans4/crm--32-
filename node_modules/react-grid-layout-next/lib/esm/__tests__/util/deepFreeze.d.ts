export default function deepFreeze<T extends Record<string, any>>(inputObj: T, options?: {
    get: boolean;
    set: boolean;
}): Readonly<T>;
