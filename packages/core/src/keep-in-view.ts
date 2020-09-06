interface Position {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
type Bounds = Position & Size;

interface Data {
    anchorBounds: Bounds;
    overlayBounds: Bounds;
    viewport: Size;
}

export function keepInView(
    dir: `x` | `y`,
    { overlayBounds, anchorBounds, viewport }: Data
): number {
    const sizeField = dir === `x` ? `width` : `height`;
    const posField = dir === `x` ? `x` : `y`;
    const oppositePosField = dir === `x` ? `y` : `x`;
    const overlaySize = overlayBounds[sizeField];
    const overlayPos = overlayBounds[posField];
    const overflowDir =
        overlayPos < 0 ? -1 : overlayPos + overlaySize > viewport[sizeField] ? 1 : 0;
    if (overflowDir === 0) {
        return NaN; // no overflow
    }
    const anchorSize = anchorBounds[sizeField];
    const anchorPos = anchorBounds[posField];
    const anchorEnd = anchorPos + anchorSize;
    const dirOverlap = isAxleOverlap(posField, anchorBounds, overlayBounds);
    const oppositeDirOverlap = isAxleOverlap(oppositePosField, anchorBounds, overlayBounds);
    let inViewPos = overlayBounds[posField];
    const flip = oppositeDirOverlap && !dirOverlap;
    if (flip) {
        // flip
        const spaceBefore = anchorPos;
        const spaceAfter = viewport[sizeField] - anchorEnd;
        const worthFlip = overflowDir === -1 ? spaceBefore < spaceAfter : spaceBefore > spaceAfter;
        if (!worthFlip) {
            return NaN;
        }
        inViewPos = overlayPos >= anchorEnd ? anchorPos - overlaySize : anchorEnd; // ?anchorPos;
        if (
            (overflowDir === 1 && inViewPos > viewport[sizeField]) ||
            (overflowDir === -1 && inViewPos + overlaySize < 0)
        ) {
            // flip out of view
            return NaN;
        }
    } else {
        // push
        inViewPos = overflowDir === -1 ? 0 : viewport[sizeField] - overlaySize;
    }
    return overflowDir === -1
        ? Math.min(inViewPos, anchorEnd)
        : Math.max(inViewPos, anchorPos - overlaySize);
}
function isAxleOverlap(dir: `x` | `y`, anchorBounds: Bounds, overlayBounds: Bounds) {
    const sizeField = dir === `x` ? `width` : `height`;
    const posField = dir === `x` ? `x` : `y`;
    const anchorEnd = anchorBounds[posField] + anchorBounds[sizeField];
    const overlayEnd = overlayBounds[posField] + overlayBounds[sizeField];
    return (
        (overlayBounds[posField] > anchorBounds[posField] && overlayBounds[posField] < anchorEnd) ||
        (overlayEnd > anchorBounds[posField] && overlayEnd < anchorEnd) ||
        (overlayBounds[posField] <= anchorBounds[posField] && overlayEnd >= anchorEnd)
    );
}
