import type { DOMLayer } from './root';

export function watchEscape(rootLayer: DOMLayer) {
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== `Escape` || event.defaultPrevented || event.repeat) {
            return;
        }
        const layers = rootLayer.generateDisplayList();
        const topLayer = layers[layers.length - 1];
        topLayer.settings.onEscape?.();
    };
    window.addEventListener(`keydown`, onKeyDown);
    return {
        stop() {
            window.removeEventListener(`keydown`, onKeyDown);
        },
    };
}
