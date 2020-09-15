enum Position {
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

export type ModalPosition = Position | keyof typeof Position;
interface AbsolutePosition {
    position: 'absolute';
    top?: string | number;
    left?: string | number;
    bottom?: string | number;
    right?: string | number;
    transform?: string;
}

export function modalAbsolutePositionAsString(position: ModalPosition): string {
    const style = modalAbsolutePosition(position);
    return Object.entries(style).reduce((agg, [dec, val]) => {
        agg += dec + `:` + val + `;`;
        return agg;
    }, ``);
}

export function modalAbsolutePosition(position: ModalPosition) {
    const alignStyle: AbsolutePosition = { position: `absolute` };
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
}
