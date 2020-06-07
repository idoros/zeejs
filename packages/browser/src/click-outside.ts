import { DOMLayer } from './root';
import { BackdropElements } from './update-layers';

export function watchClickOutside(
    wrapper: HTMLElement,
    topLayer: DOMLayer,
    backdrop: BackdropElements
) {
    const onClick = (event: MouseEvent) => {
        const layers = topLayer.generateDisplayList();
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
