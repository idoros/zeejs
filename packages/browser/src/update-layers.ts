import { isFocusable, tabbable } from 'tabbable';
import type { DOMLayer } from './root';
import { isBrowser, findContainingLayer } from './utils';

export interface BackdropElements {
    hide: HTMLElement;
    block: HTMLElement;
}

export function createBackdropParts(): BackdropElements {
    return {
        block: isBrowser ? document.createElement(`zeejs-block`) : ({} as HTMLElement),
        hide: isBrowser ? document.createElement(`zeejs-hide`) : ({} as HTMLElement),
    };
}

type Focusable = HTMLElement | SVGElement;

const asyncFocusChangePromise = new WeakMap<
    Element,
    {
        promise: Promise<void>;
        blur: Focusable | void;
        focus: Focusable | void;
        focusLayer: HTMLElement | null;
    }
>();

export function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    options?: { asyncFocusChange?: false; forceFocus?: boolean }
): void;
export function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    options: { asyncFocusChange?: true; forceFocus?: boolean }
): Promise<void>;
export async function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    { asyncFocusChange, forceFocus }: { asyncFocusChange?: boolean; forceFocus?: boolean } = {}
): Promise<void> {
    const focusedElement = document.activeElement as unknown as Focusable | null;
    const layers = topLayer.generateDisplayList();
    let blocking: HTMLElement | null = null;
    let hiding: HTMLElement | null = null;
    const layersElementsToKeep = new Set<HTMLElement>();
    // append new layers, set order and find backdrop position
    for (const [index, { element, settings }] of layers.entries()) {
        if (element) {
            layersElementsToKeep.add(element);
            element.style.zIndex = String(index);
            if (element.parentElement !== wrapper) {
                wrapper.appendChild(element);
            }
        }
        if (settings.backdrop !== `none`) {
            blocking = element;
            if (settings.backdrop === `hide`) {
                hiding = element;
            }
        }
    }
    // - remove un-needed layers/backdrop
    // - find activated layers
    const activatedLayers: HTMLElement[] = [];
    const blockedIndex = blocking ? Number(blocking.style.zIndex) : 0;
    for (const element of Array.from(wrapper.children)) {
        if (element instanceof HTMLElement && layersElementsToKeep.has(element)) {
            const index = Number(element.style.zIndex);
            if (index < blockedIndex) {
                element.setAttribute(`inert`, ``);
            } else if (element.hasAttribute(`inert`)) {
                activatedLayers.push(element);
                element.removeAttribute(`inert`);
            }
        } else {
            wrapper.removeChild(element);
        }
    }
    // append backdrop if needed
    if (hiding) {
        wrapper.insertBefore(hide, hiding);
        hide.style.zIndex = hiding.style.zIndex;
    }
    if (blocking) {
        wrapper.insertBefore(block, blocking);
        block.style.zIndex = blocking.style.zIndex;
    }

    // reference active element in layer + inert check
    let elementToBlur: void | Focusable;
    let elementToFocus: void | Focusable;
    let prevFocusLayer: HTMLElement | null = null;
    let nextFocusLayer: HTMLElement | null = null;
    if (focusedElement) {
        prevFocusLayer = findContainingLayer(focusedElement);
        if (prevFocusLayer && prevFocusLayer.hasAttribute(`inert`)) {
            elementToBlur = focusedElement;
        }
    }
    // find re-focus last input from activated layer
    if (
        forceFocus ||
        (!prevFocusLayer && activatedLayers.length) ||
        (prevFocusLayer &&
            document.compareDocumentPosition(prevFocusLayer) &
                document.DOCUMENT_POSITION_DISCONNECTED)
    ) {
        // search layer with previously focused element
        for (let i = layers.length - 1; i >= 0; --i) {
            const layer = layers[i];
            if (layer.element.hasAttribute(`inert`)) {
                break;
            }
            if (layer.state.lastFocusedElement) {
                nextFocusLayer = layer.element;
                elementToFocus = layer.state.lastFocusedElement;
                break;
            }
        }
    }
    // sync/async blur/refocus
    if (elementToBlur || elementToFocus || nextFocusLayer) {
        if (asyncFocusChange) {
            let buffered = asyncFocusChangePromise.get(wrapper);
            if (buffered) {
                buffered.blur = elementToBlur;
                buffered.focus = elementToFocus;
                buffered.focusLayer = nextFocusLayer;
            } else {
                buffered = {
                    promise: Promise.resolve().then(() => {
                        const change = asyncFocusChangePromise.get(wrapper);
                        if (change) {
                            changeFocus(change);
                        }
                        asyncFocusChangePromise.delete(wrapper);
                    }),
                    blur: elementToBlur,
                    focus: elementToFocus,
                    focusLayer: nextFocusLayer,
                };
                asyncFocusChangePromise.set(wrapper, buffered);
            }
            return buffered.promise;
        } else {
            changeFocus({
                blur: elementToBlur,
                focus: elementToFocus,
                focusLayer: nextFocusLayer,
            });
        }
    }
}

function changeFocus({
    blur,
    focus,
    focusLayer,
}: {
    blur: Focusable | void;
    focus: Focusable | void;
    focusLayer: HTMLElement | null;
}) {
    if (blur) {
        blur.blur();
    }
    if (focus && isFocusable(focus)) {
        focus.focus();
    } else if (focusLayer && !focusLayer.hasAttribute(`inert`)) {
        // ToDo: currently find the first focusable when focused is to possible
        // solve issues:
        // 1. find closest in layer
        // 2. handle no focusable elements in layer (including layer itself)
        const focusList = tabbable(focusLayer, { includeContainer: true });
        if (focusList.length) {
            focusList[0].focus();
        }
    }
}
