import { DOMLayer } from './root';
import { findContainingLayer } from './focus';

export interface BackdropElements {
    hide: HTMLElement;
    block: HTMLElement;
}
export function createBackdropParts(): BackdropElements {
    return {
        block: document.createElement(`zeejs-block`),
        hide: document.createElement(`zeejs-hide`),
    };
}

type Focusable = HTMLElement | SVGElement;

const lastFocusMap = new WeakMap<Element, Focusable>();
const asyncFocusChangePromise = new WeakMap<
    Element,
    {
        promise: Promise<void>;
        blur: Focusable | void;
        focus: Focusable | void;
    }
>();

export function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    asyncFocusChange?: false
): void;
export function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    asyncFocusChange: true
): Promise<void>;
export async function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    { hide, block }: BackdropElements,
    asyncFocusChange?: boolean
): Promise<void> {
    const focusedElement = (document.activeElement as unknown) as Focusable | null;
    const layers = topLayer.generateDisplayList();
    let blocking: HTMLElement | null = null;
    let hiding: HTMLElement | null = null;
    const layersIds = new Set<string>();
    // append new layers, set order and find backdrop position
    for (const [index, { element, settings }] of layers.entries()) {
        layersIds.add(element.id);
        element.setAttribute(`z-index`, String(index));
        if (element.parentElement !== wrapper) {
            wrapper.appendChild(element);
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
    const activatedLayers: Element[] = [];
    const blockedIndex = hiding
        ? Number(hiding.getAttribute(`z-index`))
        : blocking
            ? Number(blocking.getAttribute(`z-index`))
            : 0;
    for (const element of Array.from(wrapper.children)) {
        if (!layersIds.has(element.id)) {
            wrapper.removeChild(element);
        } else {
            const index = Number(element.getAttribute(`z-index`));
            if (index < blockedIndex) {
                element.setAttribute(`inert`, ``);
            } else if (element.hasAttribute(`inert`)) {
                activatedLayers.push(element);
                element.removeAttribute(`inert`);
            }
        }
    }
    // append backdrop if needed
    if (hiding) {
        wrapper.insertBefore(hide, hiding);
        hide.setAttribute(`z-index`, hiding.getAttribute(`z-index`)!);
    }
    if (blocking) {
        wrapper.insertBefore(block, blocking);
        block.setAttribute(`z-index`, blocking.getAttribute(`z-index`)!);
    }
    // find and save reference for active element in inert layer
    let elementToBlur: void | Focusable;
    let elementToFocus: void | Focusable;
    if (focusedElement) {
        const focusedLayer = findContainingLayer(focusedElement);
        if (focusedLayer && focusedLayer.hasAttribute(`inert`)) {
            lastFocusMap.set(focusedLayer, focusedElement);
            elementToBlur = focusedElement;
        }
    }
    // find re-focus last input from activated layer
    const currentlyFocused = !!(
        document.activeElement && findContainingLayer(document.activeElement)
    );
    if (!currentlyFocused && activatedLayers.length) {
        // top layer last
        const sortedLayers = activatedLayers.sort(
            (a, b) => Number(a.getAttribute(`z-index`)) - Number(b.getAttribute(`z-index`))
        );
        let refocusElement: Focusable | void;
        while (!refocusElement && sortedLayers.length) {
            const currentLayer = sortedLayers.pop()!;
            const lastInput = lastFocusMap.get(currentLayer);
            if (lastInput) {
                refocusElement = lastInput;
            }
        }
        if (refocusElement) {
            elementToFocus = refocusElement;
        }
    }
    // sync/async blur/refocus
    if (asyncFocusChange) {
        let buffered = asyncFocusChangePromise.get(wrapper);
        if (buffered) {
            buffered.blur = elementToBlur;
            buffered.focus = elementToFocus;
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
            };
            asyncFocusChangePromise.set(wrapper, buffered);
        }
        return buffered.promise;
    } else {
        changeFocus({
            blur: elementToBlur,
            focus: elementToFocus,
        });
    }
}

function changeFocus({ blur, focus }: { blur: Focusable | void; focus: Focusable | void }) {
    if (blur) {
        blur.blur();
    }
    if (focus) {
        focus.focus();
    }
}
