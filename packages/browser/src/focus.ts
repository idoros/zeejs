import type { DOMLayer } from './root';
import { findContainingLayer } from './utils';
import { tabbable } from 'tabbable';

export function watchFocus(layersWrapper: HTMLElement, topLayer: DOMLayer) {
    const onFocus = createOnFocusHandler(topLayer);
    layersWrapper.addEventListener(`focus`, onFocus, { capture: true });
    layersWrapper.addEventListener(`keydown`, onKeyDown, { capture: true });
    return {
        stop() {
            layersWrapper.removeEventListener(`focus`, onFocus);
            layersWrapper.removeEventListener(`keydown`, onKeyDown);
        },
    };
}

type Focusable = { focus: () => void };
type FocusableElement = HTMLElement | SVGElement;

const createOnFocusHandler = (topLayer: DOMLayer) => {
    return (event: FocusEvent) => {
        const target = event.target;
        if (target && target instanceof HTMLElement) {
            const layer = findContainingLayer(target);
            if (!layer || layer.hasAttribute(`inert`)) {
                // ToDo: skip in case focus is invoked by `onKeyDown`
                const availableLayers = Array.from(
                    document.querySelectorAll<HTMLElement>(`zeejs-layer:not([inert])`)
                );
                target.blur();
                event.stopPropagation();
                while (availableLayers.length) {
                    const layer = availableLayers.shift()!;
                    const layerId = layer.id;
                    const origin = document.querySelector<HTMLElement>(
                        `[data-origin="${layerId}"]`
                    );
                    if (origin) {
                        const element = queryFirstTabbable(layer, origin, true);
                        if (element) {
                            element.focus();
                            return;
                        }
                    }
                }
            }
        }
        if (topLayer) {
            const layers = topLayer.generateDisplayList();
            const activeElement = document.activeElement;
            const currentLayerElement = activeElement ? findContainingLayer(activeElement) : null;
            const focusedLayers = new Set<DOMLayer>();
            for (const layer of layers.reverse()) {
                if (layer.element === currentLayerElement) {
                    let focusedLayer: DOMLayer | null = layer;
                    while (focusedLayer) {
                        focusedLayers.add(focusedLayer);
                        updateLayer(focusedLayer, true);
                        focusedLayer = focusedLayer.parentLayer;
                    }
                } else if (!focusedLayers.has(layer)) {
                    updateLayer(layer, false);
                }
            }
        }
    };
};

function updateLayer(layer: DOMLayer, isInside: boolean) {
    if (layer.state.focusInside !== isInside) {
        layer.state.focusInside = isInside;
        if (layer.settings.onFocusChange) {
            layer.settings.onFocusChange();
        }
    }
}

const onKeyDown = (event: KeyboardEvent) => {
    if (event.code !== `Tab`) {
        return;
    }
    const isForward = !event.shiftKey;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement || activeElement instanceof SVGElement) {
        const layer = findContainingLayer(activeElement);
        if (layer) {
            const nextElement = queryNextTabbable(layer, activeElement, isForward);
            if (nextElement) {
                event.preventDefault();
                nextElement.focus();
            }
        }
    }
};

function queryNextTabbable(
    layer: HTMLElement,
    currentElement: FocusableElement,
    isForward: boolean
): Focusable | null {
    const list = tabbable(layer);
    if (list.length === 0) {
        throw new Error(
            `queryNextTabbable was called with currentElement that is not contained in layer`
        );
    }
    const edgeIndex = isForward ? list.length - 1 : 0;
    const currentIndex = list.indexOf(currentElement);
    if (currentIndex === edgeIndex) {
        const layerId = layer.id;
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
            const originElement = document.querySelector<FocusableElement>(
                `[data-origin="${layerId}"]`
            );
            if (!originElement) {
                // ToDo: handle missing origin?
                return null;
            }
            const originLayer = findContainingLayer(originElement);
            if (!originLayer) {
                // ToDo: handle missing origin layer, maybe return originElement?
                return null;
            }
            // stay in layer if parent is inert (trap focus)
            if (originLayer.hasAttribute(`inert`)) {
                const loopBackToElement = isForward ? list[0] : list[list.length - 1];
                return queryTabbableElement(layer, loopBackToElement, isForward);
            }
            // move to next element in parent layer
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

function queryTabbableElement(layer: HTMLElement, element: FocusableElement, isForward: boolean) {
    const isOriginElement = element.tagName === `ZEEJS-ORIGIN`;
    if (isOriginElement) {
        return queryFirstTabbable(layer, element, isForward);
    } else {
        return element;
    }
}

function queryFirstTabbable(
    originLayer: HTMLElement,
    originElement: FocusableElement,
    isForward: boolean
): Focusable | null {
    const originId = originElement.dataset.origin;
    if (!originId) {
        // ToDo: handle invalid origin element
        return null;
    }
    const layer = document.querySelector<HTMLElement>(`#${originId}`);
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
