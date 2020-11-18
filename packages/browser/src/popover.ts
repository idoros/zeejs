import { layoutOverlay, overlayPosition } from './layout-overlay';
import { keepInView } from './keep-in-view';

interface PopoverOptions {
    positionX: keyof typeof overlayPosition;
    positionY: keyof typeof overlayPosition;
    matchWidth: boolean;
    matchHeight: boolean;
    avoidAnchor: boolean;
}

const defaultOptions = {
    positionX: `center`,
    positionY: `before`,
    matchWidth: false,
    matchHeight: false,
    avoidAnchor: false,
} as const;

export const popover = () => {
    let bindPosition: ReturnType<typeof layoutOverlay> | null = null;
    let openedOverlay: HTMLElement | null = null;
    let options: PopoverOptions = defaultOptions;
    const getOptions = () => ({
        x: overlayPosition[options.positionX],
        y: overlayPosition[options.positionY],
        width: options.matchWidth,
        height: options.matchHeight,
        onOverflow: keepInView.bind(null, { avoidAnchor: options.avoidAnchor }),
    });
    return {
        overlayCSSClass(cssClass?: string) {
            if (cssClass) {
                return bindPosition ? cssClass : cssClass + ` ` + layoutOverlay.NOT_PLACED;
            } else {
                return bindPosition ? `` : layoutOverlay.NOT_PLACED;
            }
        },
        open(
            { anchor, overlay }: { anchor: Element; overlay: HTMLElement },
            overlayOptions: Partial<PopoverOptions> = {}
        ) {
            if (bindPosition) {
                return;
            }
            openedOverlay = overlay;
            options = {
                ...defaultOptions,
                ...overlayOptions,
            };
            bindPosition = layoutOverlay(anchor, overlay, getOptions());
            overlay.classList.remove(layoutOverlay.NOT_PLACED);
        },
        close() {
            openedOverlay?.classList.add(layoutOverlay.NOT_PLACED);
            bindPosition?.stop();
            bindPosition = null;
        },
        updateOptions(newOptions: Partial<PopoverOptions>) {
            if (bindPosition) {
                options = {
                    ...options,
                    ...newOptions,
                };
                bindPosition.updateOptions(getOptions());
            }
        },
        isOpen() {
            return !!bindPosition;
        },
    };
};
