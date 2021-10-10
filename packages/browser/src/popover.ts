import { layoutOverlay, OverlayPosition } from './layout-overlay';
import { keepInView, KeepInViewData } from './keep-in-view';

interface PopoverOptions {
    positionX: OverlayPosition;
    positionY: OverlayPosition;
    avoidAnchor: boolean;
    matchWidth: boolean;
    matchHeight: boolean;
}

const defaultOptions: PopoverOptions = {
    positionX: `center`,
    positionY: `after`,
    avoidAnchor: false,
    matchWidth: false,
    matchHeight: false,
} as const;

export const popover = () => {
    let bindPosition: ReturnType<typeof layoutOverlay> | null = null;
    let openedOverlay: HTMLElement | null = null;
    let options: PopoverOptions = defaultOptions;
    const getOptions = () => ({
        x: options.positionX,
        y: options.positionY,
        width: options.matchWidth,
        height: options.matchHeight,
        onOverflow: (data: KeepInViewData) =>
            keepInView(data, { avoidAnchor: options.avoidAnchor }),
    });
    return {
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
