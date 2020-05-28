import tabbable from 'tabbable';

export function watchFocus(layersWrapper: HTMLElement) {
    layersWrapper.addEventListener(`keydown`, onKeyDown, { capture: true });
    return {
        stop() {
            layersWrapper.removeEventListener(`keydown`, onKeyDown);
        },
    };
}

const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === `Tab` && document.activeElement) {
        const activeElement = document.activeElement;
        const layer = findContainingLayer(activeElement);
        const isForward = !event.shiftKey;
        if (layer && activeElement) {
            const nextElement = queryNextTabbable(layer, activeElement, isForward);
            if (nextElement) {
                event.preventDefault();
                nextElement.focus();
            }
        }
    }
};

type Focusable = { focus: () => void };

function queryNextTabbable(
    layer: HTMLElement,
    currentElement: Element,
    isForward: boolean
): Focusable | null {
    const list = tabbable(layer);
    if (list.length === 0) {
        throw new Error(
            `queryNextTabbable was called with currentElement that is not contained in layer`
        );
    }
    const edgeIndex = isForward ? list.length - 1 : 0;
    const currentIndex = list.indexOf(currentElement as HTMLElement);
    if (currentIndex === edgeIndex) {
        const layerId = layer.dataset.id;
        if (!layerId) {
            // top layer
            if (isForward) {
                // loop to start
                return queryTabbableElement(layer, list[0], isForward);
            } else {
                // move backward on root layer - do nothing
                // let browser navigate to chrome (URL)
                return null;
            }
        } else {
            // nested layer
            // ToDo: handle blocking layer
            const originElement = document.querySelector(`[data-origin="${layerId}"]`);
            if (!originElement) {
                // ToDo: handle missing origin?
                return null;
            }
            const originLayer = findContainingLayer(originElement);
            if (!originLayer) {
                // ToDo: handle missing origin layer, maybe return originElement?
                return null;
            }
            return queryNextTabbable(originLayer, originElement, isForward);
        }
    }
    const nextIndex = currentIndex + (isForward ? 1 : -1);
    const nextElement = list[nextIndex];
    const isOriginElement = nextElement.tagName === `ZEEJS-ORIGIN`;
    if (isOriginElement) {
        return queryFirstTabbable(layer, nextElement, isForward);
    } else {
        return nextElement;
    }
}

function queryTabbableElement(layer: HTMLElement, element: HTMLElement, isForward: boolean) {
    const isOriginElement = element.tagName === `ZEEJS-ORIGIN`;
    if (isOriginElement) {
        return queryFirstTabbable(layer, element, isForward);
    } else {
        return element;
    }
}

function queryFirstTabbable(
    originLayer: HTMLElement,
    originElement: HTMLElement,
    isForward: boolean
): Focusable | null {
    const originId = originElement.dataset.origin;
    if (!originId) {
        // ToDo: handle invalid origin element
        return null;
    }
    const layer = document.querySelector<HTMLElement>(`[data-id="${originId}"]`);
    if (!layer) {
        // skip missing layer
        return queryNextTabbable(originLayer, originElement, isForward);
    }
    const list = tabbable(layer);
    if (list.length === 0) {
        // empty layer - query next after origin element
        return queryNextTabbable(originLayer, originElement, isForward);
    }
    const edgeIndex = isForward ? 0 : list.length - 1;
    const firstElement = list[edgeIndex];
    if (firstElement.tagName === `ZEEJS-ORIGIN`) {
        // query first element in nested layer
        return queryFirstTabbable(layer, firstElement, isForward);
    } else {
        return firstElement;
    }
}

function findContainingLayer(element: Element) {
    let current: Element | null = element;
    while (current) {
        if (current.tagName === `ZEEJS-LAYER`) {
            return current as HTMLElement;
        }
        current = current.parentElement;
    }
    return null;
}