interface OverlayOptions {
    x: overlayPosition;
    y: overlayPosition;
    width: boolean;
    height: boolean;
    onOverflow: (data: OverflowData) => void;
}
export interface OverflowData {
    anchorBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    overlayBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    viewport: {
        width: number;
        height: number;
    };
    overlay: HTMLElement;
    anchor: Element;
}
interface OverlayConfig extends OverlayOptions {
    anchor: Element;
    init: {
        width: string;
        height: string;
        overflowX: string;
        overflowY: string;
        overflow: string;
    };
}
export enum overlayPosition {
    before = `BEFORE`,
    start = `START`,
    center = `CENTER`,
    end = `END`,
    after = `AFTER`,
}

const UNSET = `zeejs-unset`;
const affectedOverlays = new Map<Element, Set<HTMLElement>>();
const overlays = new Map<HTMLElement, OverlayConfig>();
const anchors = new Map<Element, Set<HTMLElement>>();
const waitingForPosition = new Set<HTMLElement>();
let waitForPositionRequest = 0;
const resizeObserver =
    typeof ResizeObserver !== `undefined`
        ? new ResizeObserver((entries) => {
              for (const { target } of entries) {
                  if (target instanceof HTMLElement && overlays.has(target)) {
                      waitingForPosition.add(target);
                  }
                  addBoundTargets(target);
              }
              scheduleUpdate();
          })
        : null;
export const layoutOverlay = (
    anchor: Element,
    overlay: HTMLElement,
    options: Partial<OverlayOptions> = {}
) => {
    if (overlays.has(overlay)) {
        throw new Error(`failed to bind position overlay for an already bound target`);
    }
    // listen to main scroll
    if (overlays.size === 0) {
        document.addEventListener(`scroll`, onScroll, { capture: true, passive: true });
        window.addEventListener(`resize`, onResize, { capture: true, passive: true });
    }
    // save overlay configuration
    overlays.set(overlay, {
        anchor,
        x: options.x || overlayPosition.center,
        y: options.y || overlayPosition.center,
        width: options.width ?? true,
        height: options.height ?? true,
        init: {
            width: UNSET,
            height: UNSET,
            overflowX: UNSET,
            overflowY: UNSET,
            overflow: overlay.style.overflow,
        },
        onOverflow:
            options.onOverflow ||
            (() => {
                /**/
            }),
    });
    // back reference: anchor => target
    const refTargets = anchors.get(anchor) || new Set<HTMLElement>();
    refTargets.add(overlay);
    if (!anchors.has(anchor)) {
        anchors.set(anchor, refTargets);
    }
    // listen to size change
    if (resizeObserver) {
        resizeObserver.observe(anchor);
        resizeObserver.observe(overlay);
    }
    // track elements affecting overlay
    let currentParent: Element | null = anchor;
    while (currentParent) {
        const currentAffected = affectedOverlays.get(currentParent) || new Set<HTMLElement>();
        currentAffected.add(overlay);
        if (!affectedOverlays.has(currentParent)) {
            affectedOverlays.set(currentParent, currentAffected);
        }
        currentParent = currentParent.parentElement;
    }
    // sync
    update(overlay);
    return {
        stop: () => {
            const overlayConfig = overlays.get(overlay);
            if (overlayConfig) {
                // restore shorthand overflow first, because browser merges overflow-x/y together
                if (overlayConfig.init.overflow) {
                    overlay.style.overflow = overlayConfig.init.overflow;
                } else {
                    overlay.style.removeProperty(`overflow`);
                }
                restoreSize(`width`, overlayConfig, overlay);
                restoreSize(`height`, overlayConfig, overlay);
            }
            overlays.delete(overlay);
            if (resizeObserver) {
                resizeObserver.unobserve(anchor); // ToDo: prevent unobserve if another overlay is connected
                resizeObserver.unobserve(overlay); // ToDo: prevent unobserve if used as anchored for another overlay
            }
            // remove affected overlay tracking
            let currentParent: Element | null = anchor;
            while (currentParent && currentParent.tagName !== `BODY`) {
                const currentAffected = affectedOverlays.get(currentParent);
                if (currentAffected) {
                    currentAffected.delete(overlay);
                    if (!currentAffected.size) {
                        affectedOverlays.delete(currentParent);
                    }
                }
                currentParent = currentParent.parentElement;
            }
            // remove main scroll listener
            if (overlays.size === 0) {
                document.removeEventListener(`scroll`, onScroll);
                window.removeEventListener(`resize`, onResize);
            }
            // remove from update
            if (waitingForPosition.has(overlay)) {
                waitingForPosition.delete(overlay);
                if (!waitingForPosition.size && waitForPositionRequest) {
                    cancelAnimationFrame(waitForPositionRequest);
                    waitForPositionRequest = 0;
                }
            }
        },
        updateOptions: (newOptions: Partial<OverlayOptions>) => {
            const prevOptions = overlays.get(overlay);
            if (!prevOptions) {
                return;
            }
            overlays.set(overlay, {
                ...prevOptions,
                ...newOptions,
                anchor,
            });
            addBoundTargets(anchor);
            scheduleUpdate();
        },
    };
};

layoutOverlay.NOT_PLACED = `zeejs--notPlaced`;

function onScroll({ target }: Event) {
    const eventTarget = target instanceof Document ? target.body : target;
    if (eventTarget instanceof Element) {
        addBoundTargets(eventTarget);
        scheduleUpdate();
    }
}

function onResize() {
    for (const [anchor] of anchors) {
        addBoundTargets(anchor);
    }
    scheduleUpdate();
}

function addBoundTargets(modified: Element) {
    const targets = affectedOverlays.get(modified);
    if (!targets) {
        return;
    }
    for (const target of targets) {
        waitingForPosition.add(target);
        addBoundTargets(target);
    }
}

function scheduleUpdate() {
    if (!waitForPositionRequest && waitingForPosition.size) {
        waitForPositionRequest = requestAnimationFrame(() => {
            waitForPositionRequest = 0;
            flushUpdate();
        });
    }
}

function flushUpdate() {
    for (const target of [...waitingForPosition]) {
        update(target);
    }
}

function update(overlay: HTMLElement) {
    const overlayConfig = overlays.get(overlay)!;
    if (!overlayConfig) {
        return;
    }
    const { anchor, x, y, onOverflow } = overlayConfig;
    const anchorBounds = anchor.getBoundingClientRect();
    overlay.style.position = `absolute`;
    updateSize(`width`, anchorBounds, overlayConfig, overlay);
    updateSize(`height`, anchorBounds, overlayConfig, overlay);
    const overlayBounds = overlay.getBoundingClientRect();
    let offsetY = 0;
    let offsetX = 0;
    let scrollY = 0;
    let scrollX = 0;
    const offsetParent = overlay.offsetParent;
    if (!offsetParent || offsetParent.tagName === `BODY`) {
        scrollY = window.pageYOffset; // ToDo: check diff from y or scroll
        scrollX = window.pageXOffset;
    }
    if (offsetParent && offsetParent.tagName !== `BODY`) {
        ({ x: offsetX, y: offsetY } = offsetParent.getBoundingClientRect());
    }
    const yPos = getPosition(y, `y`, anchorBounds, overlayBounds);
    const xPos = getPosition(x, `x`, anchorBounds, overlayBounds);
    const desiredY = yPos + scrollY - offsetY;
    const desiredX = xPos + scrollX - offsetX;
    overlay.style.top = desiredY + `px`;
    overlay.style.left = desiredX + `px`;

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const isXOverflow = xPos < 0 || xPos + overlayBounds.width > viewportWidth;
    const isYOverflow = yPos < 0 || yPos + overlayBounds.height > viewportHeight;
    if (isXOverflow || isYOverflow) {
        onOverflow({
            anchorBounds: {
                x: anchorBounds.x + scrollX - offsetX,
                y: anchorBounds.y + scrollY - offsetY,
                width: anchorBounds.width,
                height: anchorBounds.height,
            },
            overlayBounds: {
                x: desiredX,
                y: desiredY,
                width: overlayBounds.width,
                height: overlayBounds.height,
            },
            viewport: {
                width: viewportWidth,
                height: viewportHeight,
            },
            overlay,
            anchor,
        });
    }
    waitingForPosition.delete(overlay);
}

function updateSize(
    dir: `width` | `height`,
    refRect: DOMRect,
    overlayConfig: OverlayConfig,
    overlay: HTMLElement
) {
    const { [dir]: bindDir, init } = overlayConfig;
    if (bindDir) {
        const overflow = dir === `width` ? `overflowX` : `overflowY`;
        if (init[dir] === UNSET) {
            init[dir] = overlay.style[dir];
            init[overflow] = overlay.style[overflow];
        }
        overlay.style[overflow] = `auto`;
        overlay.style[dir] = refRect[dir] + `px`;
    } else {
        restoreSize(dir, overlayConfig, overlay);
    }
}
function restoreSize(dir: `width` | `height`, overlayConfig: OverlayConfig, overlay: HTMLElement) {
    const { init } = overlayConfig;
    if (init[dir] !== UNSET) {
        const overflow = dir === `width` ? `overflowX` : `overflowY`;
        if (init[dir]) {
            overlay.style[dir] = init[dir];
        } else {
            overlay.style.removeProperty(dir);
        }
        if (init[overflow]) {
            overlay.style[overflow] = init[overflow];
        } else {
            overlay.style.removeProperty(overflow);
        }
        init[dir] = UNSET;
        init[overflow] = UNSET;
    }
}
function getPosition(pos: overlayPosition, dir: `x` | `y`, refRect: DOMRect, overlayRect: DOMRect) {
    const sizeField = dir === `x` ? `width` : `height`;
    const refPos = refRect[dir];
    const refSize = refRect[sizeField];
    const overlaySize = overlayRect[sizeField];
    switch (pos) {
        case overlayPosition.before:
            return refPos - overlaySize;
        case overlayPosition.start:
            return refPos;
        case overlayPosition.center:
            return refPos + refSize / 2 - overlaySize / 2;
        case overlayPosition.end:
            return refPos + refSize - overlaySize;
        case overlayPosition.after:
            return refPos + refSize;
    }
}
