import { DOMLayer } from './root';

export function watchClickOutside(wrapper: HTMLElement, topLayer: DOMLayer) {
    const onClick = (event: MouseEvent) => {
        const layers = topLayer.generateDisplayList();
        const target = event.target as HTMLElement;
        const layersToInform = new Set<DOMLayer>();
        let layerClickedIn: DOMLayer | null = null;
        for (const layer of layers) {
            if (
                layer.element &&
                target.compareDocumentPosition(layer.element) & document.DOCUMENT_POSITION_CONTAINS
            ) {
                layerClickedIn = layer;
            } else if (layer.settings.onClickOutside) {
                layersToInform.add(layer);
            }
        }
        // remove parents from inform set
        let current = layerClickedIn;
        while (current) {
            layersToInform.delete(current);
            current = current.parentLayer;
        }
        // inform click outside
        for (const { settings } of layersToInform) {
            settings.onClickOutside!();
        }
    };
    wrapper.addEventListener(`click`, onClick, { capture: true });
    return {
        stop() {
            wrapper.removeEventListener(`click`, onClick);
        },
    };
}
