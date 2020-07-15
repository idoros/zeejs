export const css = `
zeejs-block {
    position: fixed;top: 0;left: 0;right: 0;bottom: 0;
}
zeejs-hide {
    position: fixed;top: 0;left: 0;right: 0;bottom: 0;
    background: rgba(66, 66, 66, 0.50);
}
zeejs-origin {
    overflow: hidden;
    display: inline-block;
    width: 0;
    height:0;
}
zeejs-layer {
    pointer-events: none;
}
zeejs-layer > * {
    pointer-events: initial;
}
.zeejs--overlapWindow {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.zeejs--notPlaced, .zeejs--notPlaced * {
    visibility: hidden!important;
}
`;
