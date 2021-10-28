import type { DOMLayer } from './root';

export function watchEscape(rootLayer: DOMLayer) {
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== `Escape` || event.defaultPrevented || event.repeat) {
            return;
        }
        let stopped = false;
        const wrappedEvent = Object.assign({}, event, {
            stopPropagation() {
                stopped = true;
                event.stopPropagation();
            },
            stopImmediatePropagation() {
                stopped = true;
                event.stopImmediatePropagation();
            },
        });
        const layers = rootLayer.generateDisplayList();
        for (let i = layers.length - 1; i >= 0; --i) {
            if (stopped) {
                return;
            }
            const layer = layers[i];
            layer.settings.onEscape?.(wrappedEvent);
        }
    };
    window.addEventListener(`keydown`, onKeyDown);
    return {
        stop() {
            window.removeEventListener(`keydown`, onKeyDown);
        },
    };
}
