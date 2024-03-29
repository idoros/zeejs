import type { DOMLayer } from './root';
import type { BackdropElements } from './update-layers';

export function watchClickOutside(topLayer: DOMLayer, backdrop: BackdropElements) {
    let pointerDownLayers: ReturnType<DOMLayer['generateDisplayList']> | null = null;
    const onPointerDown = () => {
        // set available layers while mousedown to prevent any layer that
        // is created between mousedown and click to have it's click-outside called
        pointerDownLayers = topLayer.generateDisplayList();
    };
    const onClick = (event: MouseEvent) => {
        const layers = pointerDownLayers || topLayer.generateDisplayList();
        pointerDownLayers = null;
        const target = event.target as HTMLElement;
        const isBackdropClicked = target === backdrop.block;
        const backdropParentIndex = isBackdropClicked ? Number(backdrop.block.style.zIndex) - 1 : 0;
        // find clicked layer & layers that might require the event
        const layersToInform = new Set<DOMLayer>();
        let layerClickedIn: DOMLayer | null = null;
        for (const layer of layers) {
            const element = layer.element;
            const layerIndex = element ? Number(element.style.zIndex) : -1;
            if (
                (element &&
                    target.compareDocumentPosition(element) &
                        document.DOCUMENT_POSITION_CONTAINS) ||
                (isBackdropClicked && backdropParentIndex === layerIndex)
            ) {
                layerClickedIn = layer;
            } else if (
                layer.settings.onClickOutside &&
                (!isBackdropClicked || backdropParentIndex < layerIndex)
            ) {
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
            settings.onClickOutside!(target);
        }
    };

    window.addEventListener(`pointerdown`, onPointerDown, { capture: true });
    window.addEventListener(`click`, onClick, { capture: true });
    return {
        stop() {
            window.removeEventListener(`pointerdown`, onPointerDown);
            window.removeEventListener(`click`, onClick);
        },
    };
}
