import type { DOMLayer } from './root';
import type { BackdropElements } from './update-layers';
import { findContainingLayer } from './utils';

export function watchMouseInside(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    backdrop: BackdropElements
) {
    let lastTarget: Element | null = null;
    let newTarget: Element | null = null;
    let buffer: Promise<void> | null = null;

    const onMouseOut = (event: MouseEvent) => onTargetChange(event.relatedTarget);
    const onMouseOver = (event: MouseEvent) => onTargetChange(event.target);
    const onTargetChange = (nextTarget: EventTarget | null) => {
        if (nextTarget instanceof Element) {
            if (nextTarget !== lastTarget) {
                newTarget = nextTarget;
                if (!buffer) {
                    buffer = Promise.resolve().then(() => {
                        if (buffer) {
                            buffer = null;
                            updateTarget();
                        }
                    });
                }
            } else {
                buffer = null;
                newTarget = null;
            }
        }
    };
    const updateTarget = () => {
        if (newTarget === backdrop.block) {
            const parentIndex = Number(backdrop.block.style.zIndex) - 1;
            const parentLayer = topLayer
                .generateDisplayList()
                .find((layer) => Number(layer.element.style.zIndex) === parentIndex);
            newTarget = (parentLayer || topLayer).element;
        }
        if (lastTarget === newTarget) {
            return;
        }
        const lastLayerTarget = lastTarget ? findContainingLayer(lastTarget) : topLayer.element;
        const newLayerTarget = newTarget ? findContainingLayer(newTarget) : topLayer.element;
        if (lastLayerTarget === newLayerTarget) {
            return;
        }
        // search for new & old layers
        const layers = topLayer.generateDisplayList();
        let outLayer: DOMLayer | null = null;
        let overLayer: DOMLayer | null = null;
        while (!(outLayer && overLayer) && layers.length) {
            const layer = layers.shift()!;
            if (layer.element === lastLayerTarget) {
                outLayer = layer;
            } else if (layer.element === newLayerTarget) {
                overLayer = layer;
            }
        }
        // collect over layers
        const entered = new Set<DOMLayer>();
        let current = overLayer;
        while (current) {
            entered.add(current);
            current = current.parentLayer;
        }
        // inform out layers
        current = outLayer;
        while (current) {
            if (entered.has(current)) {
                current = null;
            } else {
                updateLayer(current, false);
                current = current.parentLayer;
            }
        }
        // inform over layers
        current = overLayer;
        while (current) {
            updateLayer(current, true);
            current = current.parentLayer;
        }
        // update state
        lastTarget = newTarget;
        newTarget = null;
    };

    wrapper.addEventListener(`mouseover`, onMouseOver, { capture: true, passive: true });
    wrapper.addEventListener(`mouseout`, onMouseOut, { capture: true, passive: true });
    return {
        stop() {
            buffer = null;
            wrapper.removeEventListener(`mouseover`, onMouseOver);
            wrapper.removeEventListener(`mouseout`, onMouseOut);
        },
    };
}

function updateLayer(layer: DOMLayer, isInside: boolean) {
    if (layer.state.mouseInside !== isInside) {
        layer.state.mouseInside = isInside;
        if (layer.settings.onMouseIntersection) {
            layer.settings.onMouseIntersection();
        }
    }
}
