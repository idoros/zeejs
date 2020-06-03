import { createLayer, Layer } from '@zeejs/core';
import { bindOverlay } from './bind-overlay';

export const overlapBindConfig = Symbol(`overlap-bind`);

export interface LayerSettings {
    overlap: `window` | HTMLElement;
    backdrop: `none` | `block` | `hide`;
}
export interface LayerExtended {
    element: HTMLElement;
    settings: LayerSettings;
    [overlapBindConfig]: ReturnType<typeof bindOverlay>;
}
export type DOMLayer = Layer<LayerExtended, LayerSettings>;

export const defaultLayerSettings: LayerSettings = {
    overlap: `window`,
    backdrop: `none`,
};

export function createRoot({
    onChange,
}: {
    onChange?: () => void;
} = {}) {
    let idCounter = 0;
    const rootLayer = createLayer({
        extendLayer: {
            element: (null as unknown) as HTMLElement,
            settings: defaultLayerSettings,
        } as LayerExtended,
        defaultSettings: defaultLayerSettings,
        onChange() {
            if (onChange) {
                onChange();
            }
        },
        init(layer, settings) {
            layer.settings = settings;
            layer.element = document.createElement(`zeejs-layer`); // ToDo: test that each layer has a unique element
            layer.element.id = `zeejs-layer-${idCounter++}`;
            if (layer.parentLayer) {
                if (settings.overlap === `window`) {
                    layer.element.classList.add(`zeejs--overlapWindow`);
                } else if (settings.overlap instanceof HTMLElement) {
                    layer.element.classList.add(`zeejs--overlapElement`);
                    layer[overlapBindConfig] = bindOverlay(settings.overlap, layer.element);
                }
            }
        },
        destroy(layer) {
            if (layer[overlapBindConfig]) {
                layer[overlapBindConfig].stop(); // not tested because its a side effect:/
            }
        },
    });
    return rootLayer;
}