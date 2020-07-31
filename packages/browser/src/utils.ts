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

export function isContainedBy(element: Element, possibleContainer: Element) {
    let current: Element | null = element;
    while (current) {
        if (
            current === possibleContainer ||
            current.compareDocumentPosition(possibleContainer) & document.DOCUMENT_POSITION_CONTAINS
        ) {
            return true;
        }
        current = findContainingLayer(current);
        if (!current) {
            return false;
        }
        current = document.querySelector(`[data-origin="${current.id}"]`);
    }
    return false;
}
