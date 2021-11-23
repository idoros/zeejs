import { layoutOverlay, OverlayPosition } from './layout-overlay';
import { keepInView } from './keep-in-view';

interface TooltipOptions {
    onToggle?: (isOpen: boolean) => void;
    anchor?: Element | null;
    overlay?: HTMLElement | null;
    mouseDelay?: number;
    isInOverlay?: (element: Element, overlay: Element) => boolean;
    positionX?: OverlayPosition;
    positionY?: OverlayPosition;
}

let idCounter = 0;
export const tooltip = ({
    onToggle,
    anchor,
    overlay,
    mouseDelay = 500,
    isInOverlay,
    positionX = `center`,
    positionY = `before`,
}: TooltipOptions) => {
    const id = `tooltip-${idCounter++}`;
    let isFocusHold = false;
    let isMouseIn = false;
    let isMouseInOverlay = false;
    let isOpen = false;
    let bindPosition: ReturnType<typeof layoutOverlay> | null = null;
    let buffer = 0;
    let blurBuffer = 0;
    let disableFocus = false;
    let revertAriaConnect: (() => void) | null = null;

    const onFocus = () => {
        if (disableFocus) {
            return;
        }
        isFocusHold = true;
        window.addEventListener(`mousemove`, onMouseMove, {
            once: true,
            passive: true,
            capture: true,
        });
        updateOpen();
    };
    const onBlur = () => {
        if (isMouseInOverlay) {
            return;
        }
        cancelAnimationFrame(blurBuffer);
        blurBuffer = requestAnimationFrame(() => {
            const activeElement = document.activeElement;
            if (activeElement && isIn(activeElement)) {
                return;
            }
            isFocusHold = isMouseIn = isMouseInOverlay = false;
            updateOpen();
        });
    };
    const onMouseOver = () => {
        isMouseIn = true;
        bufferUpdate(mouseDelay);
    };
    const onMouseOut = () => {
        isMouseIn = isFocusHold = false;
        bufferUpdate(mouseDelay);
    };
    const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
        const overElement = document.elementFromPoint(clientX, clientY);
        if (overElement && !isIn(overElement)) {
            isFocusHold = isMouseIn = isMouseInOverlay = false;
            bufferUpdate(mouseDelay);
        }
    };
    const flagClickOutside = () => {
        cancelAnimationFrame(blurBuffer);
        isFocusHold = isMouseIn = isMouseInOverlay = false;
        updateOpen();
    };
    const flagMouseOverOverlay = (flag: boolean) => {
        isMouseInOverlay = flag;
        if (!flag) {
            isFocusHold = false;
        }
        bufferUpdate(mouseDelay);
    };
    const flagOverlayFocus = (flag: boolean) => {
        if (flag) {
            onFocus();
        } else {
            onBlur();
        }
    };
    const onEscape = (event: KeyboardEvent) => {
        event.stopPropagation();
        cancelAnimationFrame(blurBuffer);
        isFocusHold = isMouseIn = isMouseInOverlay = false;
        updateOpen();
    };
    const isIn = (element: Element) => {
        if (isInOverlay && element) {
            if (overlay && isInOverlay(element, overlay)) {
                return true;
            }
            if (anchor && isInOverlay(element, anchor)) {
                return true;
            }
        }
        return false;
    };

    const updateOpen = () => {
        clearTimeout(buffer);
        buffer = 0;
        const newOpenState = isMouseIn || isMouseInOverlay || isFocusHold;
        if (newOpenState && !bindPosition && anchor && overlay) {
            bindPosition = layoutOverlay(anchor, overlay, {
                x: positionX,
                y: positionY,
                height: false,
                width: false,
                onOverflow: keepInView,
            });
            overlay.classList.remove(layoutOverlay.NOT_PLACED);
        } else if (!newOpenState) {
            if (bindPosition) {
                bindPosition.stop();
                bindPosition = null;
            }
            if (overlay) {
                overlay.classList.add(layoutOverlay.NOT_PLACED);
            }
        }
        if (newOpenState !== isOpen) {
            isOpen = newOpenState;
            if (!isOpen) {
                // momentarily prevent re-focus from opening again
                disableFocus = true;
                setTimeout(() => {
                    disableFocus = false;
                }, 100);
            }
            onToggle && onToggle(isOpen);
        }
    };
    const bufferUpdate = (amount: number, override = false) => {
        if (!buffer || override) {
            clearTimeout(buffer);
            buffer = window.setTimeout(updateOpen, amount);
        }
    };
    const setAnchor = (newAnchor: Element) => {
        unsetAnchor();
        anchor = newAnchor;
        anchor.addEventListener(`focus`, onFocus, { passive: true });
        anchor.addEventListener(`blur`, onBlur, { passive: true });
        anchor.addEventListener(`mouseover`, onMouseOver, { capture: true, passive: true });
        anchor.addEventListener(`mouseout`, onMouseOut, { capture: true, passive: true });
        revertAriaConnect = connectAriaLabel(newAnchor, { id, placeholder: `TOOLTIP` });
    };
    const unsetAnchor = () => {
        if (anchor) {
            anchor.removeEventListener(`focus`, onFocus);
            anchor.removeEventListener(`blur`, onBlur);
            anchor.removeEventListener(`mouseover`, onMouseOver);
            anchor.removeEventListener(`mouseout`, onMouseOut);
            if (revertAriaConnect) {
                revertAriaConnect();
                revertAriaConnect = null;
            }
        }
    };
    const setOverlay = (newOverlay: HTMLElement | null) => {
        overlay = newOverlay;
        if (overlay) {
            overlay.setAttribute(`id`, id);
            overlay.setAttribute(`role`, `tooltip`);
        }
        updateOpen();
    };

    if (anchor) {
        setAnchor(anchor);
    }
    if (overlay) {
        setOverlay(overlay);
    }

    return {
        isOpen: () => isOpen,
        setAnchor,
        flagClickOutside,
        flagMouseOverOverlay,
        flagOverlayFocus,
        onEscape,
        setOverlay,
        updatePosition({ x, y }: { x?: OverlayPosition; y?: OverlayPosition }) {
            positionX = x || `center`;
            positionY = y || `before`;
            if (bindPosition) {
                bindPosition.updateOptions({
                    x: positionX,
                    y: positionY,
                });
            }
        },
        initialOverlayCSSClass: layoutOverlay.NOT_PLACED,
        stop() {
            unsetAnchor();
            window.removeEventListener(`mousemove`, onMouseMove);
            cancelAnimationFrame(blurBuffer);
            clearTimeout(buffer);
            onToggle = undefined;
        },
    };
};

function connectAriaLabel(
    anchor: Element,
    { id, placeholder }: { id: string; placeholder: string }
) {
    const describedby = anchor.getAttribute(`aria-describedby`);
    const labelledby = anchor.getAttribute(`aria-labelledby`);
    const label = anchor.getAttribute(`aria-label`);
    if (describedby) {
        anchor.setAttribute(`aria-describedby`, describedby.replace(placeholder, id));
    }
    if (labelledby) {
        anchor.setAttribute(`aria-labelledby`, labelledby.replace(placeholder, id));
    } else if (!describedby && !label) {
        // default
        anchor.setAttribute(`aria-labelledby`, id);
    }
    return () => {
        if (describedby) {
            anchor.setAttribute(`aria-describedby`, describedby);
        }
        if (labelledby) {
            anchor.setAttribute(`aria-labelledby`, labelledby);
        } else if (!describedby && !label) {
            anchor.removeAttribute(`aria-labelledby`);
        }
    };
}
