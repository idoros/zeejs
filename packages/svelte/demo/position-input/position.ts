import type { CSSProperties } from 'react';

export enum Position {
    topLeft = `topLeft`,
    top = `top`,
    topRight = `topRight`,
    left = `left`,
    center = `center`,
    right = `right`,
    bottomLeft = `bottomLeft`,
    bottom = `bottom`,
    bottomRight = `bottomRight`,
}

export const getAbsolutePosition = (position: Position) => {
    const alignStyle: CSSProperties = { position: `absolute` };
    if (position === Position.center) {
        alignStyle.top = `50%`;
        alignStyle.left = `50%`;
        alignStyle.transform = `translate(-50%, -50%)`;
        return alignStyle;
    }
    switch (
        position // y
    ) {
        case Position.right:
        case Position.left:
            alignStyle.top = `50%`;
            alignStyle.transform = `translateY(-50%)`;
            break;
        case Position.top:
        case Position.topRight:
        case Position.topLeft:
            alignStyle.top = 0;
            break;
        case Position.bottom:
        case Position.bottomRight:
        case Position.bottomLeft:
            alignStyle.bottom = 0;
    }
    switch (
        position // x
    ) {
        case Position.top:
        case Position.bottom:
            alignStyle.left = `50%`;
            alignStyle.transform = `translateX(-50%)`;
            break;
        case Position.right:
        case Position.topRight:
        case Position.bottomRight:
            alignStyle.right = 0;
            break;
        case Position.left:
        case Position.topLeft:
        case Position.bottomLeft:
            alignStyle.left = 0;
    }
    return alignStyle;
};

export const symbolMap = {
    [Position.topLeft]: `↖`,
    [Position.top]: `↑`,
    [Position.topRight]: `↗`,
    [Position.left]: `←`,
    [Position.center]: `•`,
    [Position.right]: `→`,
    [Position.bottomLeft]: `↙`,
    [Position.bottom]: `↓`,
    [Position.bottomRight]: `↘`,
};
export const rightOf: Record<Position, Position> = {
    [Position.topLeft]: Position.top,
    [Position.top]: Position.topRight,
    [Position.topRight]: Position.left,
    [Position.left]: Position.center,
    [Position.center]: Position.right,
    [Position.right]: Position.bottomLeft,
    [Position.bottomLeft]: Position.bottom,
    [Position.bottom]: Position.bottomRight,
    [Position.bottomRight]: Position.topLeft,
};
export const underOf: Record<Position, Position> = {
    [Position.topLeft]: Position.left,
    [Position.top]: Position.center,
    [Position.topRight]: Position.right,
    [Position.left]: Position.bottomLeft,
    [Position.center]: Position.bottom,
    [Position.right]: Position.bottomRight,
    [Position.bottomLeft]: Position.topLeft,
    [Position.bottom]: Position.top,
    [Position.bottomRight]: Position.topRight,
};
export const leftOf: Record<Position, Position> = {} as any;
for (const [key, value] of Object.entries(rightOf)) {
    leftOf[(value as unknown) as Position] = key as Position;
}
export const aboveOf: Record<Position, Position> = {} as any;
for (const [key, value] of Object.entries(underOf)) {
    aboveOf[(value as unknown) as Position] = key as Position;
}
export const keyArrowMap: Record<number, Record<Position, Position>> = {
    37: leftOf,
    38: aboveOf,
    39: rightOf,
    40: underOf,
};
