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
}

export function keepInView(data: KeepInViewData, { avoidAnchor = true }: Partial<KeepInViewOptions> = {}) {
    const x = keepInViewBase(`x`, data, avoidAnchor);
    if (!isNaN(x)) {
        data.overlayBounds.x = x;
        data.overlay.style.left = x + `px`;
    }
    const y = keepInViewBase(`y`, data, avoidAnchor);
    if (!isNaN(y)) {
        data.overlayBounds.y = y;
        data.overlay.style.top = y + `px`;
    }
}
