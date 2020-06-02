import { DOMLayer } from './root';
import { findContainingLayer } from './focus';

export function createBackdropParts() {
    return {
        block: document.createElement(`zeejs-block`),
        hide: document.createElement(`zeejs-hide`),
    };
}

export function updateLayers(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    {
        hide,
        block,
    }: {
        hide: HTMLElement;
        block: HTMLElement;
    }
) {
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
    // remove old layers & backdrop
    const blockedIndex = hiding
        ? Number(hiding.getAttribute(`z-index`))
        : blocking
        ? Number(blocking.getAttribute(`z-index`))
        : 0;
    for (const element of Array.from(wrapper.children)) {
        if (!layersIds.has(element.id)) {
            wrapper.removeChild(element);
        } else {
            if (Number(element.getAttribute(`z-index`)) < blockedIndex) {
                element.setAttribute(`inert`, ``);
            } else {
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
    // blur inert active element
    if (document.activeElement) {
        const focusedLayer = findContainingLayer(document.activeElement);
        if (focusedLayer && focusedLayer.hasAttribute(`inert`)) {
            ((document.activeElement as unknown) as HTMLOrSVGElement).blur();
        }
    }
    return layers;
}
