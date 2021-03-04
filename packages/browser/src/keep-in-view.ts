import type { OverflowData } from './layout-overlay';
import { keepInView as keepInViewBase } from '@zeejs/core';

interface Data {
    anchorBounds: OverflowData['anchorBounds'];
    overlayBounds: OverflowData['overlayBounds'];
    viewport: OverflowData['viewport'];
    overlay: OverflowData['overlay'];
}

export function keepInView(data: Data) {
    const x = keepInViewBase(`x`, data, true);
    if (!isNaN(x)) {
        data.overlayBounds.x = x;
        data.overlay.style.left = x + `px`;
    }
    const y = keepInViewBase(`y`, data, true);
    if (!isNaN(y)) {
        data.overlayBounds.y = y;
        data.overlay.style.top = y + `px`;
    }
}
