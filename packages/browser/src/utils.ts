export const isBrowser = typeof window !== 'undefined';

export function findContainingLayer(element: Element) {
    let current: Element | null = element;
    while (current) {
        if (current.tagName === `ZEEJS-LAYER`) {
            return current as HTMLElement;
        }
        current = current.parentElement;
    }
    return null;
}
