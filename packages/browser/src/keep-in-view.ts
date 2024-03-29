import type { OverflowData } from './layout-overlay';
import { keepInView as keepInViewBase } from '@zeejs/core';

export interface KeepInViewData {
    anchorBounds: OverflowData['anchorBounds'];
    overlayBounds: OverflowData['overlayBounds'];
    viewport: OverflowData['viewport'];
    overlay: OverflowData['overlay'];
}

export interface KeepInViewOptions {
    avoidAnchor: boolean;
    margin: number;
}

export function keepInView(
    data: KeepInViewData,
    { avoidAnchor = true, margin = 0 }: Partial<KeepInViewOptions> = {}
) {
    const x = keepInViewBase(`x`, data, avoidAnchor, margin);
    if (!isNaN(x)) {
        data.overlayBounds.x = x;
        data.overlay.style.left = x + `px`;
    }
    const y = keepInViewBase(`y`, data, avoidAnchor, margin);
    if (!isNaN(y)) {
        data.overlayBounds.y = y;
        data.overlay.style.top = y + `px`;
    }
}
