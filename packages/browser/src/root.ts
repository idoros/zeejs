import { createLayer, Layer } from '@zeejs/core';
import { layoutOverlay } from './layout-overlay';
import { isBrowser } from './utils';

export const overlapBindConfig = Symbol(`overlap-bind`);

export interface LayerSettings {
    overlap: `window` | HTMLElement;
    backdrop: `none` | `block` | `hide`;
    onClickOutside?: (target: EventTarget) => void;
    onMouseIntersection?: () => void;
    onFocusChange?: () => void;
    generateElement: boolean;
}
export interface LayerExtended {
    id: string;
    element: HTMLElement;
    settings: LayerSettings;
    state: {
        mouseInside: boolean;
        focusInside: boolean;
        lastFocusedElement: HTMLElement | SVGElement | null;
    };
    setElement: (this: DOMLayer, element: HTMLElement) => void;
    [overlapBindConfig]: ReturnType<typeof layoutOverlay>;
}
export type DOMLayer = Layer<LayerExtended, LayerSettings>;

export const defaultLayerSettings: LayerSettings = {
    overlap: `window`,
    backdrop: `none`,
    generateElement: true,
};

export function createRoot({
    onChange,
}: {
    onChange?: () => void;
} = {}) {
    let idCounter = 0;
    const rootLayer = createLayer({
        extendLayer: {
            element: null as unknown as HTMLElement,
            settings: defaultLayerSettings,
            setElement: function (element: HTMLElement) {
                if (this.element) {
                    throw new Error(
                        `cannot setElement on a layer that was already initiated with an element`
                    );
                }
                if (element.tagName !== `ZEEJS-LAYER`) {
                    throw new Error(`cannot setElement on a layer that is not <zeejs-layer>`);
                }
                this.element = element;
                initLayerElement(this);
                if (onChange) {
                    onChange();
                }
            },
        } as LayerExtended,
        defaultSettings: defaultLayerSettings,
        onChange() {
            if (onChange) {
                onChange();
            }
        },
        init(layer, settings) {
            layer.state = {
                mouseInside: false,
                focusInside: false,
                lastFocusedElement: null,
            };
            layer.settings = settings;
            layer.id = `zeejs-layer-${idCounter++}`;
            if (settings.generateElement && isBrowser) {
                layer.element = document.createElement(`zeejs-layer`); // ToDo: test that each layer has a unique element
                initLayerElement(layer);
            }
        },
        destroy(layer) {
            if (layer[overlapBindConfig]) {
                layer[overlapBindConfig].stop(); // not tested because its a side effect:/
            }
        },
    });
    function initLayerElement(layer: DOMLayer) {
        const { element, settings, parentLayer } = layer;
        element.id = layer.id;
        if (parentLayer) {
            if (settings.overlap === `window`) {
                element.classList.add(`zeejs--overlapWindow`);
            } else if (settings.overlap instanceof HTMLElement) {
                element.classList.add(`zeejs--overlapElement`);
                layer[overlapBindConfig] = layoutOverlay(settings.overlap, element);
            }
        }
    }
    return rootLayer;
}
